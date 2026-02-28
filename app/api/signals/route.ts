import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSignalsPage } from "@/lib/data/signals";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const result = await getSignalsPage({
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    sentiment: searchParams.get("sentiment") ?? undefined,
    page,
  });

  return NextResponse.json(result);
}
