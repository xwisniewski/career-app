import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { buildProfileImportPrompt, type ProfileImportOutput } from "@/lib/prompts";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EDUCATION_LEVELS = new Set([
  "High School",
  "Bachelor's",
  "Master's",
  "PhD",
  "Bootcamp",
  "Self-taught",
]);

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asStringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, arr) => arr.findIndex((other) => other.toLowerCase() === item.toLowerCase()) === index)
    .slice(0, max);
}

function clampInt(value: unknown, min: number, max: number): number | null {
  const num = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(num)) return null;
  return Math.max(min, Math.min(max, Math.round(num)));
}

function clampConfidence(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(1, num));
}

function normalizeDraft(raw: unknown): ProfileImportOutput {
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const education = asString(data.educationLevel);

  const primarySkills = Array.isArray(data.primarySkills)
    ? data.primarySkills
        .map((item) => {
          const skill = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
          const name = asString(skill.name);
          if (!name) return null;
          return {
            name,
            proficiencyLevel: (clampInt(skill.proficiencyLevel, 1, 5) ?? 3) as 1 | 2 | 3 | 4 | 5,
            yearsUsed: clampInt(skill.yearsUsed, 0, 60),
          };
        })
        .filter((item): item is ProfileImportOutput["primarySkills"][number] => item !== null)
        .filter(
          (item, index, arr) =>
            arr.findIndex((other) => other.name.toLowerCase() === item.name.toLowerCase()) === index
        )
        .slice(0, 12)
    : [];

  const networkStrengthByIndustry = Array.isArray(data.networkStrengthByIndustry)
    ? data.networkStrengthByIndustry
        .map((item) => {
          const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
          const industry = asString(entry.industry);
          if (!industry) return null;
          return {
            industry,
            strength: (clampInt(entry.strength, 1, 3) ?? 1) as 1 | 2 | 3,
          };
        })
        .filter((item): item is ProfileImportOutput["networkStrengthByIndustry"][number] => item !== null)
        .slice(0, 5)
    : [];

  const confidence =
    data.confidence && typeof data.confidence === "object"
      ? (data.confidence as Record<string, unknown>)
      : {};

  return {
    currentRole: asString(data.currentRole),
    currentIndustry: asString(data.currentIndustry),
    yearsOfExperience: clampInt(data.yearsOfExperience, 0, 60),
    educationLevel: education && EDUCATION_LEVELS.has(education) ? education : null,
    educationField: asString(data.educationField),
    currentLocation: asString(data.currentLocation),
    primarySkills,
    learningSkills: asStringArray(data.learningSkills, 8),
    desiredSkills: asStringArray(data.desiredSkills, 8),
    targetRoles: asStringArray(data.targetRoles, 5),
    targetIndustries: asStringArray(data.targetIndustries, 5),
    networkStrengthByIndustry,
    confidence: {
      currentSituation: clampConfidence(confidence.currentSituation),
      skills: clampConfidence(confidence.skills),
      goals: clampConfidence(confidence.goals),
    },
    notes: asStringArray(data.notes, 5),
  };
}

export async function extractProfileImport(rawText: string): Promise<ProfileImportOutput> {
  const cleanText = rawText.replace(/\s+/g, " ").trim();
  if (cleanText.length < 80) {
    throw new Error("Not enough profile text to import.");
  }

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2500,
    messages: [{ role: "user", content: buildProfileImportPrompt(cleanText) }],
  });

  const rawResponse = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  const jsonText = rawResponse.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();

  try {
    return normalizeDraft(JSON.parse(jsonText));
  } catch {
    throw new Error("Profile import returned invalid JSON.");
  }
}
