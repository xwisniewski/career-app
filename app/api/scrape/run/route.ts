import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { runOrchestrator } from "@/lib/scrapers/orchestrator";

export async function POST(req: Request) {
  // Allow Vercel Cron calls — Vercel sends Authorization: Bearer <CRON_SECRET>
  // Also accept x-cron-secret for manual curl testing
  const authHeader = req.headers.get("authorization");
  const xSecret = req.headers.get("x-cron-secret");
  const cronSecret = authHeader?.replace("Bearer ", "") ?? xSecret;
  if (cronSecret && cronSecret === process.env.SCRAPER_CRON_SECRET) {
    // Fire and forget — cron doesn't wait for completion
    runOrchestrator().catch((err) => console.error("[scrape/run cron]", err));
    return NextResponse.json({ ok: true, message: "Scrape started" });
  }

  // Otherwise require admin session
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fire and forget — admin button doesn't wait either
  runOrchestrator().catch((err) => console.error("[scrape/run admin]", err));
  return NextResponse.json({ ok: true, message: "Scrape started" });
}
