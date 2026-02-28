import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { buildSignalCategorizationPrompt, type SignalCategorizationOutput } from "@/lib/prompts";
import type { RawSignal, ParsedSignal } from "@/lib/scrapers/base";
import type { SignalCategory, Sentiment } from "@/app/generated/prisma/client";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const VALID_CATEGORIES = new Set([
  "JOB_MARKET", "CAPITAL_FLOWS", "SKILL_DEMAND", "DISPLACEMENT_RISK", "POLICY",
]);
const VALID_SENTIMENTS = new Set(["POSITIVE", "NEGATIVE", "NEUTRAL"]);

export async function categorizeSignal(raw: RawSignal): Promise<ParsedSignal | null> {
  try {
    const prompt = buildSignalCategorizationPrompt(raw.rawContent);

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("")
      .replace(/^```(?:json)?\n?/m, "")
      .replace(/\n?```$/m, "")
      .trim();

    const parsed: SignalCategorizationOutput = JSON.parse(text);

    // Validate required fields
    if (
      !VALID_CATEGORIES.has(parsed.category) ||
      !VALID_SENTIMENTS.has(parsed.sentiment) ||
      ![1, 2, 3].includes(parsed.magnitude) ||
      !parsed.headline ||
      !parsed.dataPoint
    ) {
      console.warn("[categorize] Invalid output for signal:", raw.sourceUrl);
      return null;
    }

    return {
      source: raw.source,
      sourceUrl: raw.sourceUrl,
      rawContent: raw.rawContent,
      scrapedAt: raw.scrapedAt,
      category: parsed.category as SignalCategory,
      topic: parsed.topic,
      headline: parsed.headline,
      dataPoint: parsed.dataPoint,
      sentiment: parsed.sentiment as Sentiment,
      magnitude: parsed.magnitude as 1 | 2 | 3,
      relevantIndustries: parsed.relevantIndustries ?? [],
      relevantRoles: parsed.relevantRoles ?? [],
      relevantSkills: parsed.relevantSkills ?? [],
    };
  } catch (err) {
    console.error("[categorize] Failed for", raw.sourceUrl, err);
    return null;
  }
}
