import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { runOrchestrator } from "@/lib/scrapers/orchestrator";

export const maxDuration = 60;

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const xSecret = req.headers.get("x-cron-secret");
  const cronSecret = authHeader?.replace("Bearer ", "") ?? xSecret;
  if (cronSecret && cronSecret === process.env.SCRAPER_CRON_SECRET) {
    try {
      await runOrchestrator();
      return NextResponse.json({ ok: true, message: "Scrape complete" });
    } catch (err) {
      console.error("[scrape/run cron]", err);
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await runOrchestrator();
    return NextResponse.json({ ok: true, message: "Scrape complete" });
  } catch (err) {
    console.error("[scrape/run admin]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
