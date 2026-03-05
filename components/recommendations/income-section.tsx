import type { FullRecommendation, RecommendationProfile } from "@/lib/data/recommendations";

export function IncomeSection({
  rec,
  profile,
}: {
  rec: FullRecommendation;
  profile: RecommendationProfile;
}) {
  const current = profile.currentCompensation ?? 0;
  const goal = profile.incomeGoal ?? 0;
  const gap = goal - current;
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

  return (
    <section id="income" className="flex flex-col gap-6">
      <div className="section-header">
        <h2 className="text-[20px] font-semibold text-white tracking-[-0.02em]">Income Trajectory</h2>
        <p className="text-[14px] text-zinc-500">Where you are vs. where you need to be.</p>
      </div>

      {goal > 0 && (
        <div className="rounded-[10px] border border-zinc-800 p-6">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[12px] text-zinc-400 mb-1">Current</p>
              <p className="text-[24px] font-semibold text-white tracking-[-0.02em]">
                {current > 0 ? `$${current.toLocaleString()}` : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-zinc-400 mb-1">Goal</p>
              <p className="text-[24px] font-semibold text-white tracking-[-0.02em]">
                ${goal.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[12px] text-zinc-400">
            <span>{pct}% of goal</span>
            {gap > 0 && <span>${gap.toLocaleString()} gap</span>}
          </div>
        </div>
      )}

      <div className="rounded-[10px] border border-zinc-800 p-6">
        <p className="label mb-3">Assessment</p>
        <p className="text-[14px] text-zinc-300 leading-relaxed">
          {rec.incomeTrajectoryAssessment}
        </p>
      </div>

      {(rec.biggestOpportunities.length > 0 || rec.biggestRisks.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rec.biggestOpportunities.length > 0 && (
            <div className="rounded-[10px] border border-emerald-500/20 bg-emerald-500/10 p-5">
              <p className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider mb-3">
                Leverage points
              </p>
              <ul className="space-y-2">
                {rec.biggestOpportunities.map((o, i) => (
                  <li key={i} className="text-[13px] text-emerald-300 flex gap-2 leading-snug">
                    <span className="shrink-0 mt-0.5 text-emerald-400">→</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {rec.biggestRisks.length > 0 && (
            <div className="rounded-[10px] border border-red-500/20 bg-red-500/10 p-5">
              <p className="text-[11px] font-medium text-red-400 uppercase tracking-wider mb-3">
                Watch out for
              </p>
              <ul className="space-y-2">
                {rec.biggestRisks.map((r, i) => (
                  <li key={i} className="text-[13px] text-red-300 flex gap-2 leading-snug">
                    <span className="shrink-0 mt-0.5 text-red-400">—</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
