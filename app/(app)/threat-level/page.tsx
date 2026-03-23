import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLatestThreatSnapshot, getSparklineData } from "@/lib/data/threat-level";
import { ScoreDial } from "@/components/threat-level/score-dial";
import { BreakdownGrid } from "@/components/threat-level/breakdown-grid";
import { SignalLedger } from "@/components/threat-level/signal-ledger";
import { Counterfactors } from "@/components/threat-level/counterfactors";
import { RecommendedAction } from "@/components/threat-level/recommended-action";
import { ThreatSparkline } from "@/components/threat-level/sparkline";

export default async function ThreatLevelPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [snapshot, sparkline] = await Promise.all([
    getLatestThreatSnapshot(session.user.id),
    getSparklineData(session.user.id),
  ]);

  if (!snapshot) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold text-white mb-2">Threat Level</h1>
        <p className="text-[13px] text-zinc-400 mb-6">
          Your personal economic threat score — grounded in the{" "}
          <span className="text-zinc-300">Anthropic Economic Index</span>, not synthetic data.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <p className="text-[14px] text-zinc-400 mb-2">No score computed yet.</p>
          <p className="text-[12px] text-zinc-600">
            The nightly scoring cron runs at 2am UTC. An admin can trigger it manually from the Admin panel.
          </p>
        </div>
      </div>
    );
  }

  const deltaSign = snapshot.delta !== null && snapshot.delta > 0 ? "+" : "";
  const deltaColor =
    snapshot.delta === null
      ? "text-zinc-500"
      : snapshot.delta > 0
      ? "text-red-400"
      : snapshot.delta < 0
      ? "text-green-400"
      : "text-zinc-500";

  const riskLabel =
    snapshot.score >= 67 ? "High Risk" : snapshot.score >= 34 ? "Moderate Risk" : "Low Risk";
  const riskColor =
    snapshot.score >= 67
      ? "text-red-400 bg-red-950/30 border-red-900/40"
      : snapshot.score >= 34
      ? "text-amber-400 bg-amber-950/30 border-amber-900/40"
      : "text-green-400 bg-green-950/30 border-green-900/40";

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white mb-1">Threat Level</h1>
        <p className="text-[13px] text-zinc-500">
          AI-era exposure score based on the{" "}
          <span className="text-zinc-300 font-medium">Anthropic Economic Index</span> — observed coverage, not theoretical capability.
          The early signal is hiring slowdowns, not unemployment.
        </p>
      </div>

      {/* Score hero */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-8">
        <ScoreDial score={snapshot.score} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${riskColor}`}>
              {riskLabel}
            </span>
            {snapshot.delta !== null && (
              <span className={`text-[12px] font-medium ${deltaColor}`}>
                {deltaSign}{snapshot.delta} pts from yesterday
              </span>
            )}
          </div>
          <p className="text-[13px] text-zinc-400 mt-2 leading-relaxed">
            Score as of {new Date(snapshot.computedAt).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
            {snapshot.matchedOccupation && (
              <>
                {" "}· Matched occupation:{" "}
                <span className="text-zinc-300">{snapshot.matchedOccupation}</span>
                {snapshot.exposureScore !== null && (
                  <span className="text-zinc-500">
                    {" "}({Math.round(snapshot.exposureScore * 100)}% observed AI coverage)
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Sparkline */}
      <ThreatSparkline data={sparkline} />

      {/* Sub-score breakdown */}
      <BreakdownGrid
        roleRisk={snapshot.roleRisk}
        industryRisk={snapshot.industryRisk}
        skillsGap={snapshot.skillsGap}
        companyTypeRisk={snapshot.companyTypeRisk}
        matchedOccupation={snapshot.matchedOccupation}
        exposureScore={snapshot.exposureScore}
      />

      {/* Recommended action */}
      <RecommendedAction
        action={snapshot.recommendedAction}
      />

      {/* Signal Ledger + Counterfactors side by side on wider screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SignalLedger drivers={snapshot.signalDrivers} />
        <Counterfactors counterfactors={snapshot.counterfactors} />
      </div>

      {/* Data source note */}
      <p className="text-[11px] text-zinc-600 text-center pb-2">
        Role exposure sourced from{" "}
        <span className="text-zinc-500">Anthropic/EconomicIndex</span> (Massenkoff & McCrory, 2026).
        Score recomputes nightly.
      </p>
    </div>
  );
}
