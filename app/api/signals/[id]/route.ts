import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSignalById } from "@/lib/data/signals";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await getSignalById(id);

  if (!result.signal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(result);
}
