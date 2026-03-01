import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateRecommendation } from "@/lib/ai/recommend";

export const maxDuration = 60;

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const xSecret = req.headers.get("x-cron-secret");
  const cronSecret = authHeader?.replace("Bearer ", "") ?? xSecret;
  if (!cronSecret || cronSecret !== process.env.SCRAPER_CRON_SECRET) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    const recId = await generateRecommendation(userId);
    return NextResponse.json({ ok: true, recommendationId: recId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/regen]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
