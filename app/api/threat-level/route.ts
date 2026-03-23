import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLatestThreatSnapshot, getSparklineData } from "@/lib/data/threat-level";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [snapshot, sparkline] = await Promise.all([
    getLatestThreatSnapshot(session.user.id),
    getSparklineData(session.user.id),
  ]);

  return NextResponse.json({ snapshot, sparkline });
}
