/**
 * CompanyTypeRiskSource — uses recent layoff and displacement signals to
 * assess whether the user's company-type / industry is in an active
 * contraction wave.
 *
 * Contributes up to 10 points to the composite threat score.
 */

import type { ThreatSignalSource, ScoringContext, SourceResult, SignalDriver, Counterfactor } from "@/lib/threat-level/types";

export class CompanyTypeRiskSource implements ThreatSignalSource {
  readonly name = "CompanyTypeRisk (layoff/displacement signals)";
  readonly maxPoints = 10;

  async compute(ctx: ScoringContext): Promise<SourceResult> {
    const { profile, signals } = ctx;

    const userIndustries = [
      profile.currentIndustry,
      ...profile.targetIndustries,
    ].filter((x): x is string => Boolean(x)).map((s) => s.toLowerCase());

    // Only look at last 30 days of DISPLACEMENT_RISK signals (most current wave)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const displacementSignals = signals.filter(
      (s) =>
        s.category === "DISPLACEMENT_RISK" &&
        s.sentiment === "NEGATIVE" &&
        s.scrapedAt >= thirtyDaysAgo
    );

    let rawScore = 5; // neutral baseline
    const drivers: SignalDriver[] = [];
    const counterfactors: Counterfactor[] = [];

    for (const sig of displacementSignals) {
      const isRelevant =
        userIndustries.length === 0 ||
        sig.relevantIndustries.some((ind) => userIndustries.includes(ind.toLowerCase())) ||
        (profile.currentRole &&
          sig.relevantRoles.some((r) => r.toLowerCase().includes(profile.currentRole!.toLowerCase())));

      if (isRelevant) {
        const bump = sig.magnitude === 3 ? 2 : 1;
        rawScore += bump;
        drivers.push({
          signalId: sig.id,
          headline: sig.headline,
          category: sig.category,
          contribution: bump,
          explanation: `Active displacement wave in your sector: ${sig.dataPoint.split(/[.!?]/)[0]}.`,
        });
      }
    }

    // Positive JOB_MARKET signals in user's space reduce this risk
    const positiveJobSignals = signals.filter(
      (s) => s.category === "JOB_MARKET" && s.sentiment === "POSITIVE"
    );
    for (const sig of positiveJobSignals) {
      const isRelevant = sig.relevantIndustries.some((ind) =>
        userIndustries.includes(ind.toLowerCase())
      );
      if (isRelevant) {
        rawScore = Math.max(0, rawScore - 1);
        counterfactors.push({
          signalId: sig.id,
          headline: sig.headline,
          category: sig.category,
          pointsOffset: 1,
          explanation: `Active hiring in your space: ${sig.headline}.`,
        });
      }
    }

    const score = Math.min(this.maxPoints, Math.max(0, rawScore));
    return {
      score,
      drivers: drivers.slice(0, 3),
      counterfactors: counterfactors.slice(0, 2),
    };
  }
}
