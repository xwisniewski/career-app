import "server-only";
import { db } from "@/lib/db";

export async function getTeamPageData() {
  const profiles = await db.userProfile.findMany({
    where: { onboardingComplete: true },
    include: { primarySkills: true },
  });

  const n = profiles.length;
  if (n === 0) return null;

  // ── Skills ────────────────────────────────────────────────────────────────
  const skillMap = new Map<string, { total: number; count: number }>();
  for (const p of profiles) {
    for (const s of p.primarySkills) {
      const key = s.name.toLowerCase();
      const existing = skillMap.get(key) ?? { total: 0, count: 0 };
      skillMap.set(key, {
        total: existing.total + s.proficiencyLevel,
        count: existing.count + 1,
      });
    }
  }
  const topSkills = [...skillMap.entries()]
    .map(([name, { total, count }]) => ({
      name: profiles
        .flatMap((p) => p.primarySkills)
        .find((s) => s.name.toLowerCase() === name)?.name ?? name,
      avgLevel: Math.round((total / count) * 10) / 10,
      memberCount: count,
    }))
    .sort((a, b) => b.memberCount - a.memberCount || b.avgLevel - a.avgLevel)
    .slice(0, 12);

  // ── Target roles ──────────────────────────────────────────────────────────
  const roleMap = new Map<string, number>();
  for (const p of profiles) {
    for (const r of p.targetRoles) {
      roleMap.set(r, (roleMap.get(r) ?? 0) + 1);
    }
  }
  const topRoles = [...roleMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([role, count]) => ({ role, count }));

  // ── Target industries ─────────────────────────────────────────────────────
  const industryMap = new Map<string, number>();
  for (const p of profiles) {
    for (const ind of p.targetIndustries) {
      industryMap.set(ind, (industryMap.get(ind) ?? 0) + 1);
    }
    if (p.currentIndustry) {
      industryMap.set(p.currentIndustry, (industryMap.get(p.currentIndustry) ?? 0) + 1);
    }
  }
  const topIndustries = [...industryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([industry, count]) => ({ industry, count }));

  // ── Experience buckets ────────────────────────────────────────────────────
  const expBuckets = [
    { label: "0–2 yrs", min: 0, max: 2 },
    { label: "3–5 yrs", min: 3, max: 5 },
    { label: "6–10 yrs", min: 6, max: 10 },
    { label: "11–15 yrs", min: 11, max: 15 },
    { label: "16+ yrs", min: 16, max: Infinity },
  ].map((b) => ({
    label: b.label,
    count: profiles.filter(
      (p) =>
        p.yearsOfExperience != null &&
        p.yearsOfExperience >= b.min &&
        p.yearsOfExperience <= b.max
    ).length,
  }));

  // ── Income goal buckets ───────────────────────────────────────────────────
  const incomeBuckets = [
    { label: "<$100K", max: 99_999 },
    { label: "$100–150K", max: 149_999 },
    { label: "$150–200K", max: 199_999 },
    { label: "$200–250K", max: 249_999 },
    { label: "$250–300K", max: 299_999 },
    { label: "$300K+", max: Infinity },
  ].map((b, i, arr) => ({
    label: b.label,
    count: profiles.filter((p) => {
      if (!p.incomeGoal) return false;
      const min = i === 0 ? 0 : arr[i - 1].max + 1;
      return p.incomeGoal >= min && p.incomeGoal <= b.max;
    }).length,
  }));

  // ── Preferences averages ──────────────────────────────────────────────────
  const avg = (vals: (number | null)[]) => {
    const valid = vals.filter((v): v is number => v != null);
    return valid.length ? Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10 : null;
  };

  const preferences = {
    avgRiskTolerance: avg(profiles.map((p) => p.riskTolerance)),
    avgAutonomyVsStatus: avg(profiles.map((p) => p.autonomyVsStatus)),
    avgAmbiguityTolerance: avg(profiles.map((p) => p.ambiguityTolerance)),
    avgHoursPerWeek: avg(profiles.map((p) => p.hoursPerWeekForLearning)),
  };

  // ── Work environment breakdown ────────────────────────────────────────────
  const workEnvMap = new Map<string, number>();
  for (const p of profiles) {
    if (p.workEnvironmentPreference) {
      workEnvMap.set(p.workEnvironmentPreference, (workEnvMap.get(p.workEnvironmentPreference) ?? 0) + 1);
    }
  }
  const workEnvBreakdown = [...workEnvMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([env, count]) => ({ env, count }));

  // ── Learning style breakdown ───────────────────────────────────────────────
  const learnMap = new Map<string, number>();
  for (const p of profiles) {
    if (p.preferredLearningStyle) {
      learnMap.set(p.preferredLearningStyle, (learnMap.get(p.preferredLearningStyle) ?? 0) + 1);
    }
  }
  const learningStyles = [...learnMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([style, count]) => ({ style, count }));

  return {
    memberCount: n,
    topSkills,
    topRoles,
    topIndustries,
    expBuckets,
    incomeBuckets,
    preferences,
    workEnvBreakdown,
    learningStyles,
  };
}

export type TeamPageData = NonNullable<Awaited<ReturnType<typeof getTeamPageData>>>;
