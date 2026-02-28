import "server-only";
import { db } from "@/lib/db";

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
};

export async function getDashboardData(userId: string): Promise<{
  profile: DashboardProfile | null;
  recommendation: RecommendationRow | null;
  signals: SignalRow[];
}> {
  const [profile, recommendation] = await Promise.all([
    db.userProfile.findUnique({
      where: { userId },
      include: { primarySkills: { select: { name: true } } },
    }),
    db.careerRecommendation.findFirst({
      where: { userId, isLatest: true },
      orderBy: { generatedAt: "desc" },
    }),
  ]);

  if (!profile) return { profile: null, recommendation: null, signals: [] };

  const userIndustries = [profile.currentIndustry, ...profile.targetIndustries].filter(
    (x): x is string => !!x
  );
  const userRoles = [profile.currentRole, ...profile.targetRoles].filter(
    (x): x is string => !!x
  );
  const userSkills = profile.primarySkills.map((s) => s.name);

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
    .map((s) => {
      let score = s.magnitude;
      for (const ind of s.relevantIndustries) {
        if (userIndustries.some((u) => u.toLowerCase() === ind.toLowerCase())) score += 3;
      }
      for (const role of s.relevantRoles) {
        if (userRoles.some((u) => u.toLowerCase() === role.toLowerCase())) score += 2;
      }
      for (const skill of s.relevantSkills) {
        if (userSkills.some((u) => u.toLowerCase() === skill.toLowerCase())) score += 1;
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
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    profile: {
      onboardingComplete: profile.onboardingComplete,
      currentRole: profile.currentRole,
      currentIndustry: profile.currentIndustry,
      targetRoles: profile.targetRoles,
      targetIndustries: profile.targetIndustries,
      primarySkillNames: userSkills,
      incomeGoal: profile.incomeGoal,
    },
    recommendation: recommendation
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
      : null,
    signals,
  };
}
