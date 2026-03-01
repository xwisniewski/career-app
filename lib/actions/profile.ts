"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateRecommendation } from "@/lib/ai/recommend";
import { revalidatePath } from "next/cache";
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

function triggerRegen(userId: string) {
  generateRecommendation(userId).catch((err) =>
    console.error("[profile] recommendation regen failed:", err)
  );
}

// ─── Situation ────────────────────────────────────────────────────────────────

export async function updateSituation(data: {
  currentRole: string;
  currentIndustry: string;
  yearsOfExperience: number;
  educationLevel: string;
  educationField: string;
  currentLocation: string;
}): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Unauthorized" };

  await db.userProfile.update({
    where: { userId },
    data: {
      currentRole: data.currentRole,
      currentIndustry: data.currentIndustry,
      yearsOfExperience: data.yearsOfExperience,
      educationLevel: data.educationLevel,
      educationField: data.educationField,
      currentLocation: data.currentLocation,
    },
  });

  revalidatePath("/profile");
  triggerRegen(userId);
  return { ok: true };
}

// ─── Skills ───────────────────────────────────────────────────────────────────

export async function updateSkills(data: {
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
      },
    }),
  ]);

  revalidatePath("/profile");
  triggerRegen(userId);
  return { ok: true };
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export async function updateGoals(data: {
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

  await db.userProfile.update({
    where: { userId },
    data: {
      targetRoles: data.targetRoles,
      targetIndustries: data.targetIndustries,
      targetTimeHorizon: horizonMap[data.targetTimeHorizon] ?? TimeHorizon.THREE_YEAR,
      incomeGoal: data.incomeGoal,
      currentCompensation: data.currentCompensation,
    },
  });

  revalidatePath("/profile");
  triggerRegen(userId);
  return { ok: true };
}

// ─── Preferences ──────────────────────────────────────────────────────────────

export async function updatePreferences(data: {
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

  await db.userProfile.update({
    where: { userId },
    data: {
      riskTolerance: data.riskTolerance,
      autonomyVsStatus: data.autonomyVsStatus,
      ambiguityTolerance: data.ambiguityTolerance,
      geographicFlexibility: data.geographicFlexibility as GeographicFlexibility,
      workEnvironmentPreference: data.workEnvironmentPreference as WorkEnvironment,
      familyConstraints: data.familyConstraints,
      visaStatus: data.visaStatus as VisaStatus,
      entrepreneurialInterest: data.entrepreneurialInterest,
      networkStrengthByIndustry: data.networkStrengthByIndustry,
    },
  });

  revalidatePath("/profile");
  triggerRegen(userId);
  return { ok: true };
}

// ─── Learning ─────────────────────────────────────────────────────────────────

export async function updateLearning(data: {
  hoursPerWeekForLearning: number;
  preferredLearningStyle: string;
}): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Unauthorized" };

  await db.userProfile.update({
    where: { userId },
    data: {
      hoursPerWeekForLearning: data.hoursPerWeekForLearning,
      preferredLearningStyle: data.preferredLearningStyle as LearningStyle,
    },
  });

  revalidatePath("/profile");
  triggerRegen(userId);
  return { ok: true };
}
