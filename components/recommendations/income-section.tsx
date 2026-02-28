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
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Income Trajectory</h2>
        <p className="text-sm text-gray-400 mt-0.5">Where you are vs. where you need to be.</p>
      </div>

      {/* Gap visualizer */}
      {goal > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Current</p>
              <p className="text-xl font-bold text-gray-900">
                {current > 0 ? `$${current.toLocaleString()}` : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Goal</p>
              <p className="text-xl font-bold text-gray-900">${goal.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gray-900 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{pct}% of goal</span>
            {gap > 0 && <span>${gap.toLocaleString()} gap</span>}
          </div>
        </div>
      )}

      {/* Assessment */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Assessment
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          {rec.incomeTrajectoryAssessment}
        </p>
      </div>

      {/* Opportunities & risks as leverage points */}
      {(rec.biggestOpportunities.length > 0 || rec.biggestRisks.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rec.biggestOpportunities.length > 0 && (
            <div className="bg-green-50 rounded-xl border border-green-100 p-5">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">
                Leverage points
              </p>
              <ul className="space-y-2">
                {rec.biggestOpportunities.map((o, i) => (
                  <li key={i} className="text-sm text-green-800 flex gap-2">
                    <span className="shrink-0 mt-0.5 text-green-500">→</span>
                    <span className="leading-snug">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {rec.biggestRisks.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-100 p-5">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-3">
                Watch out for
              </p>
              <ul className="space-y-2">
                {rec.biggestRisks.map((r, i) => (
                  <li key={i} className="text-sm text-red-800 flex gap-2">
                    <span className="shrink-0 mt-0.5">⚠</span>
                    <span className="leading-snug">{r}</span>
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
