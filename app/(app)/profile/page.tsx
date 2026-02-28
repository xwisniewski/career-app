import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ProfileShell } from "@/components/profile/profile-shell";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const profile = await db.userProfile.findUnique({
    where: { userId: session.user.id },
    include: { primarySkills: true },
  });

  if (!profile) redirect("/onboarding");

  // Serialize for client
  const data = {
    currentRole: profile.currentRole ?? "",
    currentIndustry: profile.currentIndustry ?? "",
    yearsOfExperience: profile.yearsOfExperience ?? 0,
    educationLevel: profile.educationLevel ?? "",
    educationField: profile.educationField ?? "",
    currentLocation: profile.currentLocation ?? "",
    primarySkills: profile.primarySkills.map((s) => ({
      name: s.name,
      proficiencyLevel: s.proficiencyLevel,
      yearsUsed: s.yearsUsed ?? null,
    })),
    learningSkills: profile.learningSkills,
    desiredSkills: profile.desiredSkills,
    targetRoles: profile.targetRoles,
    targetIndustries: profile.targetIndustries,
    targetTimeHorizon: profile.targetTimeHorizon ?? "THREE_YEAR",
    incomeGoal: profile.incomeGoal ?? 0,
    currentCompensation: profile.currentCompensation ?? 0,
    riskTolerance: profile.riskTolerance ?? 3,
    autonomyVsStatus: profile.autonomyVsStatus ?? 3,
    ambiguityTolerance: profile.ambiguityTolerance ?? 3,
    geographicFlexibility: profile.geographicFlexibility ?? "NATIONAL",
    workEnvironmentPreference: profile.workEnvironmentPreference ?? "NO_PREFERENCE",
    familyConstraints: profile.familyConstraints ?? false,
    visaStatus: profile.visaStatus ?? "CITIZEN",
    entrepreneurialInterest: profile.entrepreneurialInterest ?? false,
    networkStrengthByIndustry: (profile.networkStrengthByIndustry as { industry: string; strength: number }[]) ?? [],
    hoursPerWeekForLearning: profile.hoursPerWeekForLearning ?? 5,
    preferredLearningStyle: profile.preferredLearningStyle ?? "MIXED",
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-400 mt-1">
          Changes trigger a new recommendation report in the background.
        </p>
      </div>
      <ProfileShell data={data} />
    </div>
  );
}
