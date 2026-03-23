/**
 * POST /api/threat-level/fetch-exposure
 *
 * Fetches occupation exposure scores from the Anthropic/EconomicIndex dataset
 * on HuggingFace and upserts them into the OccupationExposure table.
 *
 * Run once on first deploy, then quarterly when Anthropic publishes new data.
 * Protected by SCRAPER_CRON_SECRET.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchAndSeedOccupationExposure } from "@/lib/threat-level/sources/occupation-exposure";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const xSecret = req.headers.get("x-cron-secret");
  if (!xSecret || xSecret !== process.env.SCRAPER_CRON_SECRET) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await fetchAndSeedOccupationExposure();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[threat-level/fetch-exposure]", err);
    return NextResponse.json(
      { error: "Failed to fetch occupation exposure data", detail: String(err) },
      { status: 500 }
    );
  }
}
