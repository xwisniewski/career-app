import "server-only";
import { db } from "@/lib/db";

export type FullRecommendation = {
  id: string;
  generatedAt: string;
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

export type RecommendationProfile = {
  currentRole: string | null;
  currentIndustry: string | null;
  targetIndustries: string[];
  targetRoles: string[];
  incomeGoal: number | null;
  currentCompensation: number | null;
  primarySkills: { name: string; proficiencyLevel: number }[];
};

export type RecommendationPageData = {
  recommendation: FullRecommendation | null;
  profile: RecommendationProfile | null;
};

export async function getRecommendationPageData(userId: string): Promise<RecommendationPageData> {
  const [rec, profile] = await Promise.all([
    db.careerRecommendation.findFirst({
      where: { userId, isLatest: true },
      orderBy: { generatedAt: "desc" },
    }),
    db.userProfile.findUnique({
      where: { userId },
      include: { primarySkills: { select: { name: true, proficiencyLevel: true } } },
    }),
  ]);

  return {
    recommendation: rec
      ? {
          id: rec.id,
          generatedAt: rec.generatedAt.toISOString(),
          skillsToAccelerate: rec.skillsToAccelerate as FullRecommendation["skillsToAccelerate"],
          skillsToDeprioritize: rec.skillsToDeprioritize as FullRecommendation["skillsToDeprioritize"],
          skillsToWatch: rec.skillsToWatch as FullRecommendation["skillsToWatch"],
          rolesToTarget: rec.rolesToTarget as FullRecommendation["rolesToTarget"],
          rolesToAvoid: rec.rolesToAvoid as FullRecommendation["rolesToAvoid"],
          industriesToMoveToward: rec.industriesToMoveToward as FullRecommendation["industriesToMoveToward"],
          industriesToAvoid: rec.industriesToAvoid as FullRecommendation["industriesToAvoid"],
          keyNarrativeToTell: rec.keyNarrativeToTell,
          incomeTrajectoryAssessment: rec.incomeTrajectoryAssessment,
          biggestRisks: rec.biggestRisks,
          biggestOpportunities: rec.biggestOpportunities,
        }
      : null,
    profile: profile
      ? {
          currentRole: profile.currentRole,
          currentIndustry: profile.currentIndustry,
          targetIndustries: profile.targetIndustries,
          targetRoles: profile.targetRoles,
          incomeGoal: profile.incomeGoal,
          currentCompensation: profile.currentCompensation,
          primarySkills: profile.primarySkills,
        }
      : null,
  };
}
