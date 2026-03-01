import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateRecommendation } from "@/lib/ai/recommend";

export const maxDuration = 60;

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const recId = await generateRecommendation(session.user.id);
    return NextResponse.json({ ok: true, recommendationId: recId });
  } catch (err) {
    console.error("[recommendations/refresh]", err);
    return NextResponse.json(
      { error: "Failed to generate recommendation" },
      { status: 500 }
    );
  }
}
