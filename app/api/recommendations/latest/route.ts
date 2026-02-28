import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRecommendationPageData } from "@/lib/data/recommendations";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getRecommendationPageData(session.user.id);
  return NextResponse.json(data);
}
