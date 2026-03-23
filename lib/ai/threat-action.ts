/**
 * Generate the opinionated recommended action for a user's Threat Level.
 * Uses claude-haiku — cheap, fast, called once per user per nightly batch.
 */

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { buildThreatActionPrompt, type ThreatActionOutput } from "@/lib/prompts";
import type { ThreatScoreResult } from "@/lib/threat-level/types";

const client = new Anthropic();

export async function generateThreatAction(
  userId: string,
  threatScore: ThreatScoreResult
): Promise<ThreatActionOutput> {
  const profile = await db.userProfile.findUnique({
    where: { userId },
    include: { primarySkills: true },
  });

  if (!profile) throw new Error(`No profile found for user ${userId}`);

  const prompt = buildThreatActionPrompt({ profile, threatScore });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const parsed = JSON.parse(text) as ThreatActionOutput;
    return {
      action: parsed.action ?? "Review your skills against top in-demand signals.",
      rationale: parsed.rationale ?? "",
      scoreReduction: Math.min(25, Math.max(3, parsed.scoreReduction ?? 5)),
    };
  } catch {
    // Fallback if JSON parse fails
    return {
      action: "Review your skill stack against the top SKILL_DEMAND signals to identify the highest-ROI gap to close.",
      rationale: "Signal data indicates skill coverage is the most actionable lever for your current profile.",
      scoreReduction: 5,
    };
  }
}
