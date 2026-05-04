import "server-only";
import { db } from "@/lib/db";
import type { MacroSignal } from "@/app/generated/prisma/client";
import { computeBriefDiff, type BriefDiff } from "@/lib/data/brief-diff";

export type SignalRow = {
  id: string;
  source: string;
  category: string;
  topic: string;
  headline: string;
  dataPoint: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  magnitude: number;
  relevantIndustries: string[];
  relevantRoles: string[];
  relevantSkills: string[];
  scrapedAt: string;
  sourceUrl: string;
  relevanceScore: number;
};

export type RecommendationRow = {
  id: string;
  generatedAt: string;
  skillsToAccelerate: { skill: string; reason: string; urgency: "now" | "6mo" | "1yr" }[];
  skillsToWatch: { skill: string; reason: string }[];
  rolesToTarget: { role: string; reason: string; timeHorizon: string }[];
  industriesToMoveToward: { industry: string; reason: string; confidence: number }[];
  keyNarrativeToTell: string;
  incomeTrajectoryAssessment: string;
  biggestRisks: string[];
  biggestOpportunities: string[];
};

export type DashboardProfile = {
  onboardingComplete: boolean;
  currentRole: string | null;
  currentIndustry: string | null;
  targetRoles: string[];
  targetIndustries: string[];
  primarySkillNames: string[];
  incomeGoal: number | null;
  currentCompensation: number | null;
};

export async function getDashboardData(userId: string): Promise<{
  profile: DashboardProfile | null;
  recommendation: RecommendationRow | null;
  briefDiff: BriefDiff | null;
  signals: SignalRow[];
}> {
  const [profile, recommendations] = await Promise.all([
    db.userProfile.findUnique({
      where: { userId },
      include: { primarySkills: { select: { name: true } } },
    }),
    db.careerRecommendation.findMany({
      where: { userId },
      orderBy: { generatedAt: "desc" },
      take: 2,
    }),
  ]);

  const recommendation = recommendations[0] ?? null;
  const previous = recommendations[1] ?? null;

  if (!profile) return { profile: null, recommendation: null, briefDiff: null, signals: [] };

  const userIndustries = [profile.currentIndustry, ...profile.targetIndustries].filter(
    (x): x is string => !!x
  );
  const userRoles = [profile.currentRole, ...profile.targetRoles].filter(
    (x): x is string => !!x
  );
  const userSkills = profile.primarySkills.map((s: { name: string }) => s.name);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const whereClause =
    userIndustries.length > 0 || userRoles.length > 0 || userSkills.length > 0
      ? {
          scrapedAt: { gte: thirtyDaysAgo },
          OR: [
            ...(userIndustries.length > 0
              ? [{ relevantIndustries: { hasSome: userIndustries } }]
              : []),
            ...(userRoles.length > 0 ? [{ relevantRoles: { hasSome: userRoles } }] : []),
            ...(userSkills.length > 0 ? [{ relevantSkills: { hasSome: userSkills } }] : []),
          ],
        }
      : { scrapedAt: { gte: thirtyDaysAgo } };

  const rawSignals = await db.macroSignal.findMany({
    where: whereClause,
    orderBy: { scrapedAt: "desc" },
    take: 100,
  });

  const signals: SignalRow[] = rawSignals
    .map((s: MacroSignal) => {
      let score = s.magnitude;
      for (const ind of s.relevantIndustries) {
        if (userIndustries.some((u: string) => u.toLowerCase() === ind.toLowerCase())) score += 3;
      }
      for (const role of s.relevantRoles) {
        if (userRoles.some((u: string) => u.toLowerCase() === role.toLowerCase())) score += 2;
      }
      for (const skill of s.relevantSkills) {
        if (userSkills.some((u: string) => u.toLowerCase() === skill.toLowerCase())) score += 1;
      }
      return {
        id: s.id,
        source: s.source,
        category: s.category as string,
        topic: s.topic,
        headline: s.headline,
        dataPoint: s.dataPoint,
        sentiment: s.sentiment as "POSITIVE" | "NEGATIVE" | "NEUTRAL",
        magnitude: s.magnitude,
        relevantIndustries: s.relevantIndustries,
        relevantRoles: s.relevantRoles,
        relevantSkills: s.relevantSkills,
        scrapedAt: s.scrapedAt.toISOString(),
        sourceUrl: s.sourceUrl,
        relevanceScore: score,
      };
    })
    .sort((a: SignalRow, b: SignalRow) => b.relevanceScore - a.relevanceScore);

  const recRow: RecommendationRow | null = recommendation
    ? {
        id: recommendation.id,
        generatedAt: recommendation.generatedAt.toISOString(),
        skillsToAccelerate: recommendation.skillsToAccelerate as RecommendationRow["skillsToAccelerate"],
        skillsToWatch: recommendation.skillsToWatch as RecommendationRow["skillsToWatch"],
        rolesToTarget: recommendation.rolesToTarget as RecommendationRow["rolesToTarget"],
        industriesToMoveToward: recommendation.industriesToMoveToward as RecommendationRow["industriesToMoveToward"],
        keyNarrativeToTell: recommendation.keyNarrativeToTell,
        incomeTrajectoryAssessment: recommendation.incomeTrajectoryAssessment,
        biggestRisks: recommendation.biggestRisks,
        biggestOpportunities: recommendation.biggestOpportunities,
      }
    : null;

  let briefDiff: BriefDiff | null = null;
  if (recRow && previous) {
    const diff = computeBriefDiff(recRow, {
      biggestOpportunities: previous.biggestOpportunities,
      biggestRisks: previous.biggestRisks,
      skillsToAccelerate: previous.skillsToAccelerate as { skill: string }[],
    });
    diff.previousGeneratedAt = previous.generatedAt.toISOString();
    const hasChanges =
      diff.newOpportunities.length > 0 ||
      diff.removedOpportunities.length > 0 ||
      diff.newRisks.length > 0 ||
      diff.removedRisks.length > 0 ||
      diff.newSkills.length > 0 ||
      diff.removedSkills.length > 0;
    briefDiff = hasChanges ? diff : null;
  }

  return {
    profile: {
      onboardingComplete: profile.onboardingComplete,
      currentRole: profile.currentRole,
      currentIndustry: profile.currentIndustry,
      targetRoles: profile.targetRoles,
      targetIndustries: profile.targetIndustries,
      primarySkillNames: userSkills,
      incomeGoal: profile.incomeGoal,
      currentCompensation: profile.currentCompensation,
    },
    recommendation: recRow,
    briefDiff,
    signals,
  };
}
