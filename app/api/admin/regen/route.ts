import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateRecommendation } from "@/lib/ai/recommend";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    const recId = await generateRecommendation(userId);
    return NextResponse.json({ ok: true, recommendationId: recId });
  } catch (err) {
    console.error("[admin/regen]", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
