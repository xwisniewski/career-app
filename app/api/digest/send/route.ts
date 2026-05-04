import { NextResponse } from "next/server";
import { sendWeeklyDigests } from "@/lib/email/digest";

// Called by Vercel Cron every Monday at 08:00 UTC.
// Also callable manually with CRON_SECRET header for testing.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sent, errors } = await sendWeeklyDigests();
  return NextResponse.json({ ok: true, sent, errors });
}
