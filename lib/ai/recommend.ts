import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { buildRecommendationPrompt, type CareerRecommendationOutput } from "@/lib/prompts";
import type { MacroSignal } from "@/app/generated/prisma/client";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Signal Relevance Scoring ─────────────────────────────────────────────────

function scoreSignal(
  signal: MacroSignal,
  userIndustries: string[],
  userRoles: string[],
  userSkills: string[]
): number {
  let score = 0;
  const normalize = (s: string) => s.toLowerCase();

  const normIndustries = userIndustries.map(normalize);
  const normRoles = userRoles.map(normalize);
  const normSkills = userSkills.map(normalize);

  for (const ind of signal.relevantIndustries) {
    if (normIndustries.some((u) => u.includes(normalize(ind)) || normalize(ind).includes(u))) score += 3;
  }
  for (const role of signal.relevantRoles) {
    if (normRoles.some((u) => u.includes(normalize(role)) || normalize(role).includes(u))) score += 2;
  }
  for (const skill of signal.relevantSkills) {
    if (normSkills.some((u) => u.includes(normalize(skill)) || normalize(skill).includes(u))) score += 1;
  }

  // Boost recent and high-magnitude signals
  score += signal.magnitude;
  const daysOld = (Date.now() - signal.scrapedAt.getTime()) / 86_400_000;
  if (daysOld < 7) score += 2;
  else if (daysOld < 30) score += 1;

  return score;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export async function generateRecommendation(userId: string): Promise<string> {
  // 1. Fetch profile
  const profile = await db.userProfile.findUnique({
    where: { userId },
    include: { primarySkills: true },
  });
  if (!profile) throw new Error("Profile not found for user " + userId);

  // 2. Fetch and score top signals
  const allSignals = await db.macroSignal.findMany({
    orderBy: { scrapedAt: "desc" },
    take: 150,
  });

  const userIndustries = [
    ...(profile.currentIndustry ? [profile.currentIndustry] : []),
    ...(profile.targetIndustries ?? []),
  ];
  const userRoles = [
    ...(profile.currentRole ? [profile.currentRole] : []),
    ...(profile.targetRoles ?? []),
  ];
  const userSkills = [
    ...profile.primarySkills.map((s) => s.name),
    ...(profile.learningSkills ?? []),
    ...(profile.desiredSkills ?? []),
  ];

  const scored = allSignals
    .map((s) => ({ signal: s, score: scoreSignal(s, userIndustries, userRoles, userSkills) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 25)
    .map((x) => x.signal);

  // 3. Call Claude Sonnet
  const prompt = buildRecommendationPrompt(profile, scored);

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  // Strip markdown code fences if model wraps in them
  const jsonText = rawText.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();

  let parsed: CareerRecommendationOutput;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Claude returned invalid JSON:\n" + rawText.slice(0, 500));
  }

  // 4. Mark old recommendations as not latest
  await db.careerRecommendation.updateMany({
    where: { userId, isLatest: true },
    data: { isLatest: false },
  });

  // 5. Save new recommendation
  const rec = await db.careerRecommendation.create({
    data: {
      userId,
      isLatest: true,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      skillsToAccelerate: parsed.skillsToAccelerate,
      skillsToDeprioritize: parsed.skillsToDeprioritize,
      skillsToWatch: parsed.skillsToWatch,
      rolesToTarget: parsed.rolesToTarget,
      rolesToAvoid: parsed.rolesToAvoid,
      industriesToMoveToward: parsed.industriesToMoveToward,
      industriesToAvoid: parsed.industriesToAvoid,
      keyNarrativeToTell: parsed.keyNarrativeToTell,
      incomeTrajectoryAssessment: parsed.incomeTrajectoryAssessment,
      biggestRisks: parsed.biggestRisks,
      biggestOpportunities: parsed.biggestOpportunities,
      signals: {
        connect: scored.map((s) => ({ id: s.id })),
      },
    },
  });

  return rec.id;
}
