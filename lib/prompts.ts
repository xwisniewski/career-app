/**
 * All Claude prompts live here.
 * Two concerns:
 *  1. Signal categorization (claude-haiku) — cheap, high-volume
 *  2. Recommendation generation (claude-sonnet) — expensive, cached aggressively
 */

import type { MacroSignal, UserProfile, PrimarySkill } from "@/app/generated/prisma/client";
import type { ThreatScoreResult } from "@/lib/threat-level/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CareerRecommendationOutput = {
  skillsToAccelerate: { skill: string; reason: string; urgency: "now" | "6mo" | "1yr" }[];
  skillsToDeprioritize: { skill: string; reason: string }[];
  skillsToWatch: { skill: string; reason: string }[];
  rolesToTarget: { role: string; reason: string; timeHorizon: string }[];
  rolesToAvoid: { role: string; reason: string }[];
  industriesToMoveToward: { industry: string; reason: string; confidence: number }[];
  industriesToAvoid: { industry: string; reason: string }[];
  keyNarrativeToTell: string;
  incomeTrajectoryAssessment: string;
  biggestRisks: string[];
  biggestOpportunities: string[];
};

export type SignalCategorizationOutput = {
  category: "JOB_MARKET" | "CAPITAL_FLOWS" | "SKILL_DEMAND" | "DISPLACEMENT_RISK" | "POLICY";
  topic: string;
  headline: string;
  dataPoint: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  magnitude: 1 | 2 | 3;
  relevantIndustries: string[];
  relevantRoles: string[];
  relevantSkills: string[];
};

// ─── Signal Categorization Prompt (claude-haiku) ──────────────────────────────

export function buildSignalCategorizationPrompt(rawContent: string): string {
  return `You are a labor market intelligence analyst. Analyze the following raw content scraped from a job market or economic source and extract structured signal data.

RAW CONTENT:
${rawContent}

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "category": "JOB_MARKET" | "CAPITAL_FLOWS" | "SKILL_DEMAND" | "DISPLACEMENT_RISK" | "POLICY",
  "topic": "snake_case_topic_identifier",
  "headline": "One punchy sentence summarizing the signal",
  "dataPoint": "2-4 sentences with specific numbers, percentages, or named companies. Be concrete.",
  "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
  "magnitude": 1 | 2 | 3,
  "relevantIndustries": ["Industry1", "Industry2"],
  "relevantRoles": ["Role1", "Role2"],
  "relevantSkills": ["Skill1", "Skill2"]
}

Magnitude guide: 1=minor trend, 2=significant shift, 3=structural change.
Always include specific company names, numbers, and percentages when available.`;
}

// ─── Recommendation Generation Prompt (claude-sonnet) ────────────────────────

type ProfileInput = UserProfile & { primarySkills: PrimarySkill[] };

export function buildRecommendationPrompt(
  profile: ProfileInput,
  signals: MacroSignal[]
): string {
  const skillList = profile.primarySkills
    .map((s) => `${s.name} (level ${s.proficiencyLevel}/5, ${s.yearsUsed ?? "?"} yrs)`)
    .join(", ");

  const incomeContext = [
    profile.currentCompensation ? `Current: $${profile.currentCompensation.toLocaleString()}` : null,
    profile.incomeGoal ? `Goal: $${profile.incomeGoal.toLocaleString()}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const signalSummaries = signals
    .map(
      (s, i) =>
        `[Signal ${i + 1}] ${s.category} | ${s.sentiment} | magnitude ${s.magnitude}\n` +
        `Headline: ${s.headline}\n` +
        `Data: ${s.dataPoint}\n` +
        `Relevant to: industries=${s.relevantIndustries.join(",")} roles=${s.relevantRoles.join(",")} skills=${s.relevantSkills.join(",")}`
    )
    .join("\n\n");

  return `You are a senior career strategist and labor economist. Your job is to give brutally honest, specific, actionable career advice — not generic platitudes.

You have access to ${signals.length} recent macro signals and a detailed user profile. Generate a comprehensive career recommendation report.

━━━ USER PROFILE ━━━
Current role: ${profile.currentRole ?? "Not specified"}
Industry: ${profile.currentIndustry ?? "Not specified"}
Experience: ${profile.yearsOfExperience ?? "?"} years
Location: ${profile.currentLocation ?? "Not specified"}

Skills: ${skillList || "None listed"}
Learning: ${profile.learningSkills?.join(", ") || "None"}
Desired: ${profile.desiredSkills?.join(", ") || "None"}

Target roles: ${profile.targetRoles?.join(", ") || "Not specified"}
Target industries: ${profile.targetIndustries?.join(", ") || "Not specified"}
Time horizon: ${profile.targetTimeHorizon ?? "Not specified"}
${incomeContext ? `Income: ${incomeContext}` : ""}

Risk tolerance: ${profile.riskTolerance ?? "?"}/5
Autonomy vs prestige: ${profile.autonomyVsStatus ?? "?"}/5 (5=autonomy-driven)
Ambiguity tolerance: ${profile.ambiguityTolerance ?? "?"}/5
Geographic flexibility: ${profile.geographicFlexibility ?? "Not specified"}
Work environment: ${profile.workEnvironmentPreference ?? "Not specified"}
Visa status: ${profile.visaStatus ?? "Not specified"}
Hours/week for learning: ${profile.hoursPerWeekForLearning ?? "?"}/week
Learning style: ${profile.preferredLearningStyle ?? "Not specified"}
Family constraints: ${profile.familyConstraints ? "Yes" : "No"}

━━━ MACRO SIGNALS (${signals.length} total) ━━━
${signalSummaries}

━━━ YOUR TASK ━━━
Synthesize the user's profile with these signals to produce a personalized career recommendation. Be opinionated. Name specific companies, skills, roles. Tie every recommendation back to specific signals. Never hedge — say "Do X" not "You might consider X."

${profile.incomeGoal ? `The user's income goal of $${profile.incomeGoal.toLocaleString()} must thread through ALL advice — every section should connect back to this target.` : ""}

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "skillsToAccelerate": [
    { "skill": "Skill name", "reason": "2-3 sentences tied to specific signals", "urgency": "now" | "6mo" | "1yr" }
  ],
  "skillsToDeprioritize": [
    { "skill": "Skill name", "reason": "Why this skill is declining in value based on signals" }
  ],
  "skillsToWatch": [
    { "skill": "Skill name", "reason": "Why this is emerging but not yet essential" }
  ],
  "rolesToTarget": [
    { "role": "Role name", "reason": "Specific companies hiring + why this matches profile + signal basis", "timeHorizon": "3-6 months" | "6-12 months" | "1-2 years" | "2+ years" }
  ],
  "rolesToAvoid": [
    { "role": "Role name", "reason": "Why this role is contracting or a poor fit right now" }
  ],
  "industriesToMoveToward": [
    { "industry": "Industry name", "reason": "Investment trends + hiring signals that make this attractive", "confidence": 0.1-1.0 }
  ],
  "industriesToAvoid": [
    { "industry": "Industry name", "reason": "Why this industry is contracting or risky" }
  ],
  "keyNarrativeToTell": "A 3-5 sentence positioning statement the user should use in interviews and networking. Specific, confident, no buzzwords.",
  "incomeTrajectoryAssessment": "3-5 sentences assessing realistic path to income goal, specific next steps with expected comp ranges.",
  "biggestRisks": ["Risk 1 (1 sentence, specific)", "Risk 2", "Risk 3"],
  "biggestOpportunities": ["Opportunity 1 (1 sentence, specific)", "Opportunity 2", "Opportunity 3"]
}

Rules:
- Include 3-5 items in skillsToAccelerate, 1-3 in skillsToDeprioritize, 2-4 in skillsToWatch
- Include 2-4 rolesToTarget, 1-3 rolesToAvoid
- Include 2-4 industriesToMoveToward, 1-2 industriesToAvoid
- Include exactly 3 biggestRisks and 3 biggestOpportunities
- Every recommendation must cite specific signal data (companies, percentages, numbers)
- Never use phrases like "consider", "might", "could potentially" — be direct and prescriptive`;
}

// ─── Threat Level Recommended Action Prompt (claude-haiku) ───────────────────

export type ThreatActionOutput = {
  action: string;
  rationale: string;
  scoreReduction: number; // estimated points drop if action is taken
};

type ThreatActionInput = {
  profile: UserProfile & { primarySkills: PrimarySkill[] };
  threatScore: ThreatScoreResult;
};

export function buildThreatActionPrompt(input: ThreatActionInput): string {
  const { profile, threatScore } = input;

  const incomeGap =
    profile.incomeGoal && profile.currentCompensation
      ? profile.incomeGoal - profile.currentCompensation
      : null;

  const incomeContext = incomeGap
    ? `Current comp: $${profile.currentCompensation!.toLocaleString()} | Goal: $${profile.incomeGoal!.toLocaleString()} | Gap: $${incomeGap.toLocaleString()}`
    : profile.incomeGoal
    ? `Income goal: $${profile.incomeGoal.toLocaleString()} (no current comp set)`
    : "No income goal set";

  const topDrivers = threatScore.signalDrivers
    .slice(0, 3)
    .map((d) => `- ${d.headline}: ${d.explanation}`)
    .join("\n");

  const occupationLine = threatScore.matchedOccupation
    ? `Occupation: ${threatScore.matchedOccupation} (${Math.round((threatScore.exposureScore ?? 0) * 100)}% AI observed exposure per Anthropic/EconomicIndex)`
    : "Occupation exposure: unknown";

  return `You are a career strategist generating ONE opinionated, specific recommended action for a professional based on their personal threat level data.

━━━ THREAT LEVEL CONTEXT ━━━
Composite score: ${threatScore.score}/100
Role Risk: ${threatScore.roleRisk}/40 | Industry Risk: ${threatScore.industryRisk}/25 | Skills Gap: ${threatScore.skillsGap}/25 | Company Risk: ${threatScore.companyTypeRisk}/10
${occupationLine}

Top threat drivers:
${topDrivers || "No signal data yet"}

━━━ USER PROFILE ━━━
Role: ${profile.currentRole ?? "not specified"}
Industry: ${profile.currentIndustry ?? "not specified"}
Experience: ${profile.yearsOfExperience ?? "?"} years
${incomeContext}
Primary skills: ${profile.primarySkills.map((s) => s.name).join(", ") || "none listed"}
Learning skills: ${profile.learningSkills.join(", ") || "none"}

━━━ YOUR TASK ━━━
Generate ONE specific, actionable recommended action. It must:
1. Name a concrete skill, role, company, or certification — no generalities
2. Include the income gap math if available (e.g. "targeting X at Y Company pays $Z — closes $N of your $M gap")
3. Estimate how many threat score points drop if this action is taken
4. Be a single opinionated directive, not a list
5. Be specific to the highest-weighted threat driver above

${incomeGap ? `The income gap of $${incomeGap.toLocaleString()} MUST appear in the action line with specific numbers.` : ""}

Return ONLY valid JSON (no markdown):
{
  "action": "One direct sentence: Do X at Y to achieve Z — closes $N of your gap, drops threat score N pts",
  "rationale": "2-3 sentences explaining why this specific action addresses the highest-leverage threat driver",
  "scoreReduction": 5
}

Rules:
- Never hedge ("consider", "might", "could")
- Name a real company, role, or certification
- scoreReduction must be between 3 and 25 (realistic estimate)
- The action sentence must be ≤ 25 words`;
}
