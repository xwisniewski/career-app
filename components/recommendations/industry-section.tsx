import type { FullRecommendation } from "@/lib/data/recommendations";

export function IndustrySection({ rec }: { rec: FullRecommendation }) {
  return (
    <section id="industries" className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Industry Map</h2>
        <p className="text-sm text-gray-400 mt-0.5">Where capital and hiring are flowing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Move toward */}
        {rec.industriesToMoveToward.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
              Move toward
            </p>
            {rec.industriesToMoveToward.map((ind, i) => (
              <div key={i} className="bg-white rounded-xl border border-green-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">{ind.industry}</h3>
                  <ConfidenceBar confidence={ind.confidence} />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{ind.reason}</p>
              </div>
            ))}
          </div>
        )}

        {/* Avoid */}
        {rec.industriesToAvoid.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">
              Avoid / Contracting
            </p>
            {rec.industriesToAvoid.map((ind, i) => (
              <div key={i} className="bg-white rounded-xl border border-red-100 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {ind.industry}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{ind.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, confidence)) * 100);
  const color =
    pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-400" : "bg-gray-300";

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400">{pct}%</span>
    </div>
  );
}
