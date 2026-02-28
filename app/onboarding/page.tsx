import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { OnboardingShell, type OnboardingProfile } from "@/components/onboarding/onboarding-shell";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const profile = await db.userProfile.findUnique({
    where: { userId: session.user.id },
    include: { primarySkills: true },
  });

  if (!profile) redirect("/login");
  if (profile.onboardingComplete) redirect("/dashboard");

  const data: OnboardingProfile = {
    onboardingStep: profile.onboardingStep,
    currentRole: profile.currentRole,
    currentIndustry: profile.currentIndustry,
    yearsOfExperience: profile.yearsOfExperience,
    educationLevel: profile.educationLevel,
    educationField: profile.educationField,
    currentLocation: profile.currentLocation,
    primarySkills: profile.primarySkills.map((s) => ({
      name: s.name,
      proficiencyLevel: s.proficiencyLevel,
      yearsUsed: s.yearsUsed,
    })),
    learningSkills: profile.learningSkills,
    desiredSkills: profile.desiredSkills,
    targetRoles: profile.targetRoles,
    targetIndustries: profile.targetIndustries,
    targetTimeHorizon: profile.targetTimeHorizon ?? null,
    incomeGoal: profile.incomeGoal,
    currentCompensation: profile.currentCompensation,
    riskTolerance: profile.riskTolerance,
    autonomyVsStatus: profile.autonomyVsStatus,
    ambiguityTolerance: profile.ambiguityTolerance,
    geographicFlexibility: profile.geographicFlexibility ?? null,
    workEnvironmentPreference: profile.workEnvironmentPreference ?? null,
    familyConstraints: profile.familyConstraints,
    visaStatus: profile.visaStatus ?? null,
    entrepreneurialInterest: profile.entrepreneurialInterest,
    networkStrengthByIndustry:
      (profile.networkStrengthByIndustry as { industry: string; strength: number }[] | null) ?? null,
    hoursPerWeekForLearning: profile.hoursPerWeekForLearning,
    preferredLearningStyle: profile.preferredLearningStyle ?? null,
  };

  return <OnboardingShell profile={data} />;
}
