/**
 * Threat Level scoring engine.
 *
 * Orchestrates all registered ThreatSignalSources, sums their sub-scores,
 * and merges signal drivers + counterfactors into a ranked composite result.
 *
 * To add a new signal source:
 *   1. Implement ThreatSignalSource in lib/threat-level/sources/<name>.ts
 *   2. Add it to SOURCES below
 *   3. Adjust maxPoints so sources still sum to 100
 */

import "server-only";
import { db } from "@/lib/db";
import { matchOccupation, OccupationExposureSource } from "@/lib/threat-level/sources/occupation-exposure";
import { IndustryRiskSource } from "@/lib/threat-level/sources/industry-risk";
import { SkillsGapSource } from "@/lib/threat-level/sources/skills-gap";
import { CompanyTypeRiskSource } from "@/lib/threat-level/sources/company-type-risk";
import type { ThreatScoreResult, ScoringContext } from "@/lib/threat-level/types";

// ─── Registered sources (order determines sub-score labeling) ─────────────────

const occupationSource = new OccupationExposureSource(); // maxPoints: 40
const industrySource = new IndustryRiskSource();          // maxPoints: 25
const skillsSource = new SkillsGapSource();               // maxPoints: 25
const companySource = new CompanyTypeRiskSource();         // maxPoints: 10
// Total: 100

// ─── Main scoring function ────────────────────────────────────────────────────

/**
 * Compute the full Threat Level score for a user.
 * Fetches profile + recent signals from DB internally.
 */
export async function computeThreatScore(userId: string): Promise<ThreatScoreResult> {
  // Fetch profile with skills
  const profile = await db.userProfile.findUnique({
    where: { userId },
    include: { primarySkills: true },
  });

  if (!profile) {
    throw new Error(`No profile found for user ${userId}`);
  }

  // Fetch relevant signals from last 90 days
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const userIndustries = [profile.currentIndustry, ...profile.targetIndustries].filter(Boolean);
  const userRoles = [profile.currentRole, ...profile.targetRoles].filter(Boolean);
  const userSkills = [
    ...profile.primarySkills.map((s) => s.name),
    ...profile.learningSkills,
  ].filter(Boolean);

  const signals = await db.macroSignal.findMany({
    where: {
      scrapedAt: { gte: ninetyDaysAgo },
      ...(userIndustries.length > 0 || userRoles.length > 0 || userSkills.length > 0
        ? {
            OR: [
              ...(userIndustries.length > 0 ? [{ relevantIndustries: { hasSome: userIndustries as string[] } }] : []),
              ...(userRoles.length > 0 ? [{ relevantRoles: { hasSome: userRoles as string[] } }] : []),
              ...(userSkills.length > 0 ? [{ relevantSkills: { hasSome: userSkills as string[] } }] : []),
            ],
          }
        : {}),
    },
    orderBy: { scrapedAt: "desc" },
    take: 100,
  });

  // Match occupation to HuggingFace dataset
  const occupationMatch = profile.currentRole
    ? await matchOccupation(profile.currentRole)
    : null;

  const ctx: ScoringContext = {
    profile,
    signals,
    occupationExposure: occupationMatch?.occupation ?? null,
  };

  // Run all sources in parallel
  const [occResult, indResult, skillResult, compResult] = await Promise.all([
    occupationSource.compute(ctx),
    industrySource.compute(ctx),
    skillsSource.compute(ctx),
    companySource.compute(ctx),
  ]);

  const score = Math.min(
    100,
    occResult.score + indResult.score + skillResult.score + compResult.score
  );

  // Merge and rank all drivers by contribution (highest first)
  const allDrivers = [
    ...occResult.drivers,
    ...indResult.drivers,
    ...skillResult.drivers,
    ...compResult.drivers,
  ].sort((a, b) => b.contribution - a.contribution);

  // Merge and rank all counterfactors by offset (highest first)
  const allCounterfactors = [
    ...occResult.counterfactors,
    ...indResult.counterfactors,
    ...skillResult.counterfactors,
    ...compResult.counterfactors,
  ].sort((a, b) => b.pointsOffset - a.pointsOffset);

  return {
    score,
    roleRisk: occResult.score,
    industryRisk: indResult.score,
    skillsGap: skillResult.score,
    companyTypeRisk: compResult.score,
    matchedOccupation: occupationMatch?.occupation.title ?? null,
    exposureScore: occupationMatch?.occupation.observedExposure ?? null,
    signalDrivers: allDrivers.slice(0, 5),
    counterfactors: allCounterfactors.slice(0, 3),
  };
}
