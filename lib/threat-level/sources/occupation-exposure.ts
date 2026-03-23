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

/**
 * Direct CSV download URL for the occupation exposure file.
 * Source: Anthropic/EconomicIndex, labor_market_impacts/job_exposure.csv
 * Columns: occ_code, title, observed_exposure
 */
const JOB_EXPOSURE_CSV_URL =
  "https://huggingface.co/datasets/Anthropic/EconomicIndex/resolve/main/labor_market_impacts/job_exposure.csv";

/** Fetch all occupation exposure rows from HuggingFace and upsert into DB. */
export async function fetchAndSeedOccupationExposure(): Promise<{
  fetched: number;
  upserted: number;
}> {
  const res = await fetch(JOB_EXPOSURE_CSV_URL, {
    headers: { "User-Agent": "CareerIntelligenceApp/1.0" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Failed to download job_exposure.csv: HTTP ${res.status}`);

  const csv = await res.text();
  const lines = csv.trim().split("\n");
  if (lines.length < 2) throw new Error("job_exposure.csv appears empty");

  // Parse header to find column indices
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const codeIdx = headers.indexOf("occ_code");
  const titleIdx = headers.indexOf("title");
  const exposureIdx = headers.indexOf("observed_exposure");

  if (codeIdx === -1 || titleIdx === -1 || exposureIdx === -1) {
    throw new Error(`Unexpected CSV columns: ${headers.join(", ")}`);
  }

  // Parse all data rows
  type CsvRow = { code: string; title: string; observed: number };
  const allRows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    const code = parts[codeIdx]?.trim();
    const title = parts[titleIdx]?.trim();
    const observed = parseFloat(parts[exposureIdx]?.trim() ?? "");
    if (code && title && !isNaN(observed)) {
      allRows.push({ code, title, observed });
    }
  }

  const fetchedAt = new Date();
  let upserted = 0;

  // Upsert in DB batches of 50
  for (let i = 0; i < allRows.length; i += 50) {
    const chunk = allRows.slice(i, i + 50);
    await Promise.all(
      chunk.map(async (row) => {
        await db.occupationExposure.upsert({
          where: { onetsocCode: row.code },
          create: {
            onetsocCode: row.code,
            title: row.title,
            observedExposure: row.observed,
            fetchedAt,
          },
          update: {
            title: row.title,
            observedExposure: row.observed,
            fetchedAt,
          },
        });
        upserted++;
      })
    );
  }

  return { fetched: allRows.length, upserted };
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
