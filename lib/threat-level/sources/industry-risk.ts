/**
 * IndustryRiskSource — derives industry-level risk from stored MacroSignals.
 *
 * Contributes up to 25 points to the composite threat score.
 * Negative DISPLACEMENT_RISK and JOB_MARKET signals in the user's industry
 * push the score up; positive signals reduce it.
 */

import type { ThreatSignalSource, ScoringContext, SourceResult, SignalDriver, Counterfactor } from "@/lib/threat-level/types";

export class IndustryRiskSource implements ThreatSignalSource {
  readonly name = "IndustryRisk (MacroSignals)";
  readonly maxPoints = 25;

  async compute(ctx: ScoringContext): Promise<SourceResult> {
    const { profile, signals } = ctx;

    const userIndustries = [
      profile.currentIndustry,
      ...profile.targetIndustries,
    ].filter((x): x is string => Boolean(x)).map((s) => s.toLowerCase());

    if (userIndustries.length === 0) {
      return { score: 12, drivers: [], counterfactors: [] };
    }

    // Filter to signals relevant to user's industry
    const relevant = signals.filter((s) =>
      s.relevantIndustries.some((ind) => userIndustries.includes(ind.toLowerCase()))
    );

    // Risk categories are JOB_MARKET and DISPLACEMENT_RISK
    const riskCategories = new Set(["JOB_MARKET", "DISPLACEMENT_RISK"]);

    let rawScore = 12; // neutral baseline
    const drivers: SignalDriver[] = [];
    const counterfactors: Counterfactor[] = [];

    for (const sig of relevant) {
      const isRiskCategory = riskCategories.has(sig.category);

      if (sig.sentiment === "NEGATIVE" && isRiskCategory) {
        const contribution = sig.magnitude === 3 ? 4 : sig.magnitude === 2 ? 2 : 1;
        rawScore += contribution;
        drivers.push({
          signalId: sig.id,
          headline: sig.headline,
          category: sig.category,
          contribution,
          explanation: buildExplanation(sig.headline, sig.dataPoint, userIndustries[0], "risk"),
        });
      } else if (sig.sentiment === "POSITIVE") {
        const offset = sig.magnitude === 3 ? 3 : sig.magnitude === 2 ? 1 : 0;
        if (offset > 0) {
          rawScore -= offset;
          counterfactors.push({
            signalId: sig.id,
            headline: sig.headline,
            category: sig.category,
            pointsOffset: offset,
            explanation: buildExplanation(sig.headline, sig.dataPoint, userIndustries[0], "positive"),
          });
        }
      }
    }

    // Sort drivers by contribution (highest first), take top 5
    drivers.sort((a, b) => b.contribution - a.contribution);
    counterfactors.sort((a, b) => b.pointsOffset - a.pointsOffset);

    const score = Math.min(this.maxPoints, Math.max(0, rawScore));
    return {
      score,
      drivers: drivers.slice(0, 5),
      counterfactors: counterfactors.slice(0, 3),
    };
  }
}

function buildExplanation(
  headline: string,
  dataPoint: string,
  industry: string,
  type: "risk" | "positive"
): string {
  // Pull first sentence of dataPoint for a concrete detail
  const detail = dataPoint.split(/[.!?]/)[0]?.trim() ?? headline;
  if (type === "risk") {
    return `In your ${industry} industry: ${detail}.`;
  }
  return `Positive signal for ${industry}: ${detail}.`;
}
