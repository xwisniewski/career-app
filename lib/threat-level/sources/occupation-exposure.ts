/**
 * OccupationExposureSource — first pluggable threat signal source.
 *
 * Data: Anthropic/EconomicIndex dataset (HuggingFace).
 * Paper: "Labor market impacts of AI: A new measure and early evidence"
 *        Massenkoff & McCrory, Anthropic, March 5 2026.
 *
 * Key nuance surfaced to users:
 *   Unemployment for high-exposure workers is NOT significantly elevated yet.
 *   The early damage shows up in HIRING — workers aged 22–25 in exposed
 *   occupations saw a 14% drop in job-finding rate post-ChatGPT.
 *
 * Refresh: quarterly, when Anthropic publishes new Economic Index data.
 * Fetch endpoint: POST /api/threat-level/fetch-exposure (admin-protected)
 */

import "server-only";
import { db } from "@/lib/db";
import type {
  ThreatSignalSource,
  ScoringContext,
  SourceResult,
  HFExposureRow,
} from "@/lib/threat-level/types";

// ─── HuggingFace Datasets Server API ─────────────────────────────────────────

const HF_API_BASE =
  "https://datasets-server.huggingface.co/rows?dataset=Anthropic%2FEconomicIndex&config=default&split=train";
const BATCH_SIZE = 100;

type HFApiResponse = {
  features: { name: string }[];
  rows: { row_idx: number; row: HFExposureRow }[];
  num_rows_total: number;
};

/** Fetch all occupation exposure rows from HuggingFace and upsert into DB. */
export async function fetchAndSeedOccupationExposure(): Promise<{
  fetched: number;
  upserted: number;
}> {
  // Probe first page to get total count and detect column names
  const firstPage = await fetchHFPage(0);
  const total = firstPage.num_rows_total;

  if (total === 0) throw new Error("HuggingFace dataset returned 0 rows");

  // Detect column mapping from first row
  const sampleRow = firstPage.rows[0]?.row ?? {};
  const cols = detectColumns(sampleRow);

  const allRows: HFExposureRow[] = firstPage.rows.map((r) => r.row);

  // Paginate remaining pages
  const pageCount = Math.ceil(total / BATCH_SIZE);
  for (let page = 1; page < pageCount; page++) {
    const pageData = await fetchHFPage(page * BATCH_SIZE);
    allRows.push(...pageData.rows.map((r) => r.row));
  }

  const fetchedAt = new Date();
  let upserted = 0;

  // Upsert in DB batches of 50
  for (let i = 0; i < allRows.length; i += 50) {
    const chunk = allRows.slice(i, i + 50);
    await Promise.all(
      chunk.map(async (row) => {
        const code = String(row[cols.code] ?? "").trim();
        const title = String(row[cols.title] ?? "").trim();
        const observed = Number(row[cols.observed] ?? 0);
        const theoretical = cols.theoretical ? Number(row[cols.theoretical] ?? 0) : undefined;

        if (!code || !title || isNaN(observed)) return;

        await db.occupationExposure.upsert({
          where: { onetsocCode: code },
          create: {
            onetsocCode: code,
            title,
            observedExposure: observed,
            theoreticalExposure: theoretical ?? null,
            fetchedAt,
          },
          update: {
            title,
            observedExposure: observed,
            theoreticalExposure: theoretical ?? null,
            fetchedAt,
          },
        });
        upserted++;
      })
    );
  }

  return { fetched: allRows.length, upserted };
}

async function fetchHFPage(offset: number): Promise<HFApiResponse> {
  const url = `${HF_API_BASE}&offset=${offset}&length=${BATCH_SIZE}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "CareerIntelligenceApp/1.0" },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`HuggingFace API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

type ColumnMap = {
  code: string;
  title: string;
  observed: string;
  theoretical: string | null;
};

function detectColumns(sample: HFExposureRow): ColumnMap {
  const keys = Object.keys(sample).map((k) => k.toLowerCase());

  const find = (candidates: string[]) =>
    Object.keys(sample).find((k) => candidates.includes(k.toLowerCase())) ?? "";

  return {
    code: find(["onet_soc_code", "onetsoccode", "onet_code", "soc_code", "code"]),
    title: find(["title", "occupation_title", "occupation", "name"]),
    observed: find(["observed_exposure", "observedexposure", "observed", "ai_exposure"]),
    theoretical: find(["theoretical_exposure", "theoreticalexposure", "theoretical", "beta"]) || null,
  };
}

// ─── Occupation title matcher ─────────────────────────────────────────────────

/**
 * Find the best-matching occupation for a free-text role string.
 * Uses word-overlap scoring — good enough for O*NET title matching.
 * Returns null if best overlap score < threshold.
 */
export async function matchOccupation(
  roleText: string
): Promise<{ occupation: import("@/app/generated/prisma/client").OccupationExposure; score: number } | null> {
  const occupations = await db.occupationExposure.findMany({
    select: { id: true, onetsocCode: true, title: true, observedExposure: true, theoreticalExposure: true, fetchedAt: true, createdAt: true, updatedAt: true },
  });

  if (occupations.length === 0) return null;

  const queryTokens = tokenize(roleText);
  if (queryTokens.size === 0) return null;

  let best: { occupation: (typeof occupations)[0]; score: number } | null = null;

  for (const occ of occupations) {
    const titleTokens = tokenize(occ.title);
    const intersection = [...queryTokens].filter((t) => titleTokens.has(t)).length;
    const union = new Set([...queryTokens, ...titleTokens]).size;
    const jaccard = union > 0 ? intersection / union : 0;

    if (!best || jaccard > best.score) {
      best = { occupation: occ, score: jaccard };
    }
  }

  // Require at least 20% token overlap to count as a match
  if (!best || best.score < 0.2) return null;
  return best;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  );
}

const STOP_WORDS = new Set([
  "and", "the", "for", "with", "from", "into", "that", "this", "are", "was",
  "not", "but", "all", "can", "its", "our", "has", "have", "been", "will",
  "they", "their", "more", "also", "each", "other", "than", "then",
]);

// ─── Scoring source implementation ───────────────────────────────────────────

export class OccupationExposureSource implements ThreatSignalSource {
  readonly name = "OccupationExposure (Anthropic/EconomicIndex)";
  readonly maxPoints = 40;

  async compute(ctx: ScoringContext): Promise<SourceResult> {
    const { occupationExposure, profile } = ctx;

    if (!occupationExposure) {
      // No match found — neutral default (half of max)
      return {
        score: 20,
        drivers: [],
        counterfactors: [],
      };
    }

    const rawExposure = occupationExposure.observedExposure; // 0–1
    const score = Math.round(rawExposure * this.maxPoints);

    const drivers =
      score >= 20
        ? [
            {
              signalId: `occ:${occupationExposure.onetsocCode}`,
              headline: `${occupationExposure.title} — ${Math.round(rawExposure * 100)}% AI exposure`,
              category: "OCCUPATION_EXPOSURE",
              contribution: score,
              explanation: `Anthropic's Economic Index shows ${Math.round(rawExposure * 100)}% of tasks in "${occupationExposure.title}" roles are covered by Claude today — the real signal is a hiring slowdown for new entrants, not unemployment yet.`,
            },
          ]
        : [];

    const counterfactors =
      score < 15
        ? [
            {
              signalId: `occ:${occupationExposure.onetsocCode}`,
              headline: `${occupationExposure.title} — low observed AI coverage`,
              category: "OCCUPATION_EXPOSURE",
              pointsOffset: this.maxPoints - score,
              explanation: `Only ${Math.round(rawExposure * 100)}% of tasks in your role are currently covered by AI tools per Anthropic's dataset — well below the high-risk threshold.`,
            },
          ]
        : [];

    return { score, drivers, counterfactors };
  }
}
