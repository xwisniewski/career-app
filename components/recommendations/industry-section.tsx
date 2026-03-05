import type { FullRecommendation } from "@/lib/data/recommendations";

export function IndustrySection({ rec }: { rec: FullRecommendation }) {
  return (
    <section id="industries" className="flex flex-col gap-6">
      <div className="section-header">
        <h2 className="text-[20px] font-semibold text-white tracking-[-0.02em]">Industry Map</h2>
        <p className="text-[14px] text-zinc-500">Where capital and hiring are flowing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rec.industriesToMoveToward.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Move toward</p>
            {rec.industriesToMoveToward.map((ind, i) => (
              <div key={i} className="rounded-[10px] border border-zinc-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[14px] font-semibold text-zinc-100">{ind.industry}</h3>
                  <ConfidenceBar confidence={ind.confidence} />
                </div>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{ind.reason}</p>
              </div>
            ))}
          </div>
        )}

        {rec.industriesToAvoid.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-medium text-red-400 uppercase tracking-wider">Avoid / Contracting</p>
            {rec.industriesToAvoid.map((ind, i) => (
              <div key={i} className="rounded-[10px] border border-zinc-800 bg-zinc-800/30 p-4">
                <h3 className="text-[14px] font-semibold text-zinc-400 mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {ind.industry}
                </h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{ind.reason}</p>
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

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-14 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-zinc-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-zinc-400">{pct}%</span>
    </div>
  );
}
