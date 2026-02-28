"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateRecommendation } from "@/lib/ai/recommend";
import {
  GeographicFlexibility,
  LearningStyle,
  TimeHorizon,
  VisaStatus,
  WorkEnvironment,
} from "@/app/generated/prisma/client";

type ActionResult = { ok: true } | { ok: false; error: string };

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

async function advanceStep(userId: string, step: number, extra: Record<string, unknown> = {}) {
  await db.userProfile.update({
    where: { userId },
    data: {
      ...extra,
      onboardingStep: step,
      ...(step >= 5 ? { onboardingComplete: true } : {}),
    },
  });
}

// ─── Step 1: Current Situation ────────────────────────────────────────────────

export async function saveStep1(data: {
  currentRole: string;
  currentIndustry: string;
  yearsOfExperience: number;
  educationLevel: string;
  educationField: string;
  currentLocation: string;
}): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Unauthorized" };

  await advanceStep(userId, 1, {
    currentRole: data.currentRole,
    currentIndustry: data.currentIndustry,
    yearsOfExperience: data.yearsOfExperience,
    educationLevel: data.educationLevel,
    educationField: data.educationField,
    currentLocation: data.currentLocation,
  });

  return { ok: true };
}

// ─── Step 2: Skills Inventory ─────────────────────────────────────────────────

export async function saveStep2(data: {
  primarySkills: { name: string; proficiencyLevel: number; yearsUsed: number | null }[];
  learningSkills: string[];
  desiredSkills: string[];
}): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Unauthorized" };

  const profile = await db.userProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) return { ok: false, error: "Profile not found" };

  await db.$transaction([
    db.primarySkill.deleteMany({ where: { profileId: profile.id } }),
    db.primarySkill.createMany({
      data: data.primarySkills.map((s) => ({
        profileId: profile.id,
        name: s.name,
        proficiencyLevel: s.proficiencyLevel,
        yearsUsed: s.yearsUsed,
      })),
    }),
    db.userProfile.update({
      where: { id: profile.id },
      data: {
        learningSkills: data.learningSkills,
        desiredSkills: data.desiredSkills,
        onboardingStep: 2,
      },
    }),
  ]);

  return { ok: true };
}

// ─── Step 3: Career Goals ─────────────────────────────────────────────────────

export async function saveStep3(data: {
  targetRoles: string[];
  targetIndustries: string[];
  targetTimeHorizon: string;
  incomeGoal: number;
  currentCompensation: number;
}): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Unauthorized" };

  const horizonMap: Record<string, TimeHorizon> = {
    "1yr": TimeHorizon.ONE_YEAR,
    "3yr": TimeHorizon.THREE_YEAR,
    "5yr": TimeHorizon.FIVE_YEAR,
    "10yr": TimeHorizon.TEN_YEAR,
  };

  await advanceStep(userId, 3, {
    targetRoles: data.targetRoles,
    targetIndustries: data.targetIndustries,
    targetTimeHorizon: horizonMap[data.targetTimeHorizon] ?? TimeHorizon.THREE_YEAR,
    incomeGoal: data.incomeGoal,
    currentCompensation: data.currentCompensation,
  });

  return { ok: true };
}

// ─── Step 4: Preferences ──────────────────────────────────────────────────────

export async function saveStep4(data: {
  riskTolerance: number;
  autonomyVsStatus: number;
  ambiguityTolerance: number;
  geographicFlexibility: string;
  workEnvironmentPreference: string;
  familyConstraints: boolean;
  visaStatus: string;
  entrepreneurialInterest: boolean;
  networkStrengthByIndustry: { industry: string; strength: number }[];
}): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Unauthorized" };

  await advanceStep(userId, 4, {
    riskTolerance: data.riskTolerance,
    autonomyVsStatus: data.autonomyVsStatus,
    ambiguityTolerance: data.ambiguityTolerance,
    geographicFlexibility: data.geographicFlexibility as GeographicFlexibility,
    workEnvironmentPreference: data.workEnvironmentPreference as WorkEnvironment,
    familyConstraints: data.familyConstraints,
    visaStatus: data.visaStatus as VisaStatus,
    entrepreneurialInterest: data.entrepreneurialInterest,
    networkStrengthByIndustry: data.networkStrengthByIndustry,
  });

  return { ok: true };
}

// ─── Step 5: Learning Capacity ────────────────────────────────────────────────

export async function saveStep5(data: {
  hoursPerWeekForLearning: number;
  preferredLearningStyle: string;
}): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Unauthorized" };

  await advanceStep(userId, 5, {
    hoursPerWeekForLearning: data.hoursPerWeekForLearning,
    preferredLearningStyle: data.preferredLearningStyle as LearningStyle,
  });

  // Kick off initial recommendation generation in the background (don't await — user goes to dashboard)
  generateRecommendation(userId).catch((err) =>
    console.error("[onboarding] recommendation generation failed:", err)
  );

  return { ok: true };
}
