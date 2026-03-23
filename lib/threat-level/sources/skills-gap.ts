/**
 * SkillsGapSource — measures gap between in-demand skills (from SKILL_DEMAND
 * signals) and what the user actually has.
 *
 * Contributes up to 25 points to the composite threat score.
 */

import type { ThreatSignalSource, ScoringContext, SourceResult, SignalDriver, Counterfactor } from "@/lib/threat-level/types";

export class SkillsGapSource implements ThreatSignalSource {
  readonly name = "SkillsGap (SKILL_DEMAND signals)";
  readonly maxPoints = 25;

  async compute(ctx: ScoringContext): Promise<SourceResult> {
    const { profile, signals } = ctx;

    const userSkills = new Set([
      ...profile.primarySkills.map((s) => s.name.toLowerCase()),
      ...profile.learningSkills.map((s) => s.toLowerCase()),
      ...profile.desiredSkills.map((s) => s.toLowerCase()),
    ]);

    // Only SKILL_DEMAND signals matter here
    const skillSignals = signals.filter((s) => s.category === "SKILL_DEMAND");

    if (skillSignals.length === 0) {
      return { score: 12, drivers: [], counterfactors: [] };
    }

    // Build a weighted map of demanded skills
    const demandMap = new Map<string, { weight: number; signalId: string; headline: string; dataPoint: string }>();

    for (const sig of skillSignals) {
      const w = sig.sentiment === "POSITIVE" ? sig.magnitude : 0;
      if (w === 0) continue;
      for (const skill of sig.relevantSkills) {
        const key = skill.toLowerCase();
        const existing = demandMap.get(key);
        if (!existing || existing.weight < w) {
          demandMap.set(key, { weight: w, signalId: sig.id, headline: sig.headline, dataPoint: sig.dataPoint });
        }
      }
    }

    if (demandMap.size === 0) {
      return { score: 12, drivers: [], counterfactors: [] };
    }

    // Score gap: weighted miss rate
    let totalWeight = 0;
    let missedWeight = 0;
    const gapSkills: Array<{ skill: string; weight: number; signalId: string; headline: string; dataPoint: string }> = [];
    const coveredSkills: Array<{ skill: string; weight: number; signalId: string; headline: string }> = [];

    for (const [skill, meta] of demandMap) {
      totalWeight += meta.weight;
      if (userSkills.has(skill)) {
        coveredSkills.push({ skill, ...meta });
      } else {
        missedWeight += meta.weight;
        gapSkills.push({ skill, ...meta });
      }
    }

    const gapRatio = totalWeight > 0 ? missedWeight / totalWeight : 0;
    const score = Math.round(gapRatio * this.maxPoints);

    // Top 3 gap skills become drivers
    gapSkills.sort((a, b) => b.weight - a.weight);
    const drivers: SignalDriver[] = gapSkills.slice(0, 3).map((g) => ({
      signalId: g.signalId,
      headline: g.headline,
      category: "SKILL_DEMAND",
      contribution: Math.round((g.weight / totalWeight) * this.maxPoints),
      explanation: `"${g.skill}" is in high demand but not in your current skill set — ${g.dataPoint.split(/[.!?]/)[0]}.`,
    }));

    // Top 2 covered skills become counterfactors
    coveredSkills.sort((a, b) => b.weight - a.weight);
    const counterfactors: Counterfactor[] = coveredSkills.slice(0, 2).map((c) => ({
      signalId: c.signalId,
      headline: c.headline,
      category: "SKILL_DEMAND",
      pointsOffset: Math.round((c.weight / totalWeight) * this.maxPoints),
      explanation: `You already have "${c.skill}" — a skill actively demanded in ${c.headline.toLowerCase()}.`,
    }));

    return { score, drivers, counterfactors };
  }
}
