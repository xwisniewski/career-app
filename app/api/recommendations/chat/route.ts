import { auth } from "@/auth";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question } = await request.json();
  if (!question || typeof question !== "string" || question.length > 500) {
    return NextResponse.json({ error: "Invalid question" }, { status: 400 });
  }

  const rec = await db.careerRecommendation.findFirst({
    where: { userId: session.user.id, isLatest: true },
    orderBy: { generatedAt: "desc" },
    include: { signals: { select: { headline: true, source: true, scrapedAt: true }, take: 10 } },
  });

  if (!rec) {
    return NextResponse.json({ error: "No brief found" }, { status: 404 });
  }

  const briefContext = JSON.stringify({
    skillsToAccelerate: rec.skillsToAccelerate,
    skillsToWatch: rec.skillsToWatch,
    rolesToTarget: rec.rolesToTarget,
    industriesToMoveToward: rec.industriesToMoveToward,
    biggestRisks: rec.biggestRisks,
    biggestOpportunities: rec.biggestOpportunities,
    keyNarrativeToTell: rec.keyNarrativeToTell,
    incomeTrajectoryAssessment: rec.incomeTrajectoryAssessment,
    recentSignals: rec.signals.map((s) => ({
      headline: s.headline,
      source: s.source,
      date: s.scrapedAt,
    })),
  });

  const systemPrompt = `You are Trajectory, a career intelligence assistant. You have access to a user's personalized Intelligence Brief — a synthesis of live macroeconomic signals (FRED, BLS, HN Hiring) tailored to their profile. Answer questions specifically and concisely, always grounding your answer in the brief data below. If a question cannot be answered from the brief, say so directly. Do not give generic advice.

INTELLIGENCE BRIEF (JSON):
${briefContext}`;

  const stream = anthropic.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: "user", content: question }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
