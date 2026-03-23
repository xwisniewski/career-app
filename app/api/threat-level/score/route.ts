/**
 * POST /api/threat-level/score
 *
 * Nightly cron endpoint — computes and saves ThreatLevelSnapshot for every
 * user with a completed profile. Batched (10 users at a time) and idempotent
 * (upsert on userId+date — safe to re-run for any date).
 *
 * Protected by SCRAPER_CRON_SECRET header (same pattern as /api/scrape/run).
 *
 * Body (optional):
 *   { "date": "2026-03-22" }   — defaults to today UTC
 *   { "userId": "clxxx" }      — score a single user (dev/admin use)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeThreatScore } from "@/lib/threat-level/score";
import { generateThreatAction } from "@/lib/ai/threat-action";
import { saveThreatSnapshot, getPreviousScore } from "@/lib/data/threat-level";

export const maxDuration = 300; // 5 min for large user batches

const BATCH_SIZE = 10;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.SCRAPER_CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let targetDate: Date;
  let singleUserId: string | null = null;

  try {
    const body = await req.json().catch(() => ({}));
    targetDate = body.date ? new Date(body.date) : new Date();
    singleUserId = body.userId ?? null;
  } catch {
    targetDate = new Date();
  }

  // Normalize to midnight UTC for idempotency
  targetDate.setUTCHours(0, 0, 0, 0);

  // Fetch users to process
  const users = singleUserId
    ? await db.user.findMany({
        where: { id: singleUserId, profile: { onboardingComplete: true } },
        select: { id: true },
      })
    : await db.user.findMany({
        where: { profile: { onboardingComplete: true } },
        select: { id: true },
      });

  let processed = 0;
  let failed = 0;
  const errors: { userId: string; error: string }[] = [];

  // Process in batches to avoid overwhelming DB / Claude API
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async ({ id: userId }) => {
        try {
          const [threatScore, previousScore] = await Promise.all([
            computeThreatScore(userId),
            getPreviousScore(userId, targetDate),
          ]);

          const actionResult = await generateThreatAction(userId, threatScore);

          await saveThreatSnapshot({
            userId,
            date: targetDate,
            score: threatScore.score,
            previousScore,
            roleRisk: threatScore.roleRisk,
            industryRisk: threatScore.industryRisk,
            skillsGap: threatScore.skillsGap,
            companyTypeRisk: threatScore.companyTypeRisk,
            matchedOccupation: threatScore.matchedOccupation,
            exposureScore: threatScore.exposureScore,
            signalDrivers: threatScore.signalDrivers,
            counterfactors: threatScore.counterfactors,
            recommendedAction: actionResult.action,
          });

          processed++;
        } catch (err) {
          failed++;
          errors.push({ userId, error: String(err) });
          console.error(`[threat-level/score] Failed for user ${userId}:`, err);
        }
      })
    );

    // Small pause between batches to avoid rate-limit spikes
    if (i + BATCH_SIZE < users.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return NextResponse.json({
    ok: true,
    date: targetDate.toISOString().split("T")[0],
    total: users.length,
    processed,
    failed,
    ...(errors.length > 0 ? { errors } : {}),
  });
}
