import type { FullRecommendation } from "@/lib/data/recommendations";

export function RolesSection({ rec }: { rec: FullRecommendation }) {
  return (
    <section id="roles" className="flex flex-col gap-6">
      <div className="section-header">
        <h2 className="text-[20px] font-semibold text-white tracking-[-0.02em]">Role Intelligence</h2>
        <p className="text-[14px] text-zinc-500">Where to move, what to exit.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rec.rolesToTarget.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Target</p>
            {rec.rolesToTarget.map((r, i) => (
              <div key={i} className="rounded-[10px] border border-zinc-800 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-[14px] font-semibold text-zinc-100">{r.role}</h3>
                  <span className="text-[11px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded shrink-0">
                    {r.timeHorizon}
                  </span>
                </div>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{r.reason}</p>
              </div>
            ))}
          </div>
        )}

        {rec.rolesToAvoid.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-medium text-red-400 uppercase tracking-wider">Avoid / Exit</p>
            {rec.rolesToAvoid.map((r, i) => (
              <div key={i} className="rounded-[10px] border border-zinc-800 bg-zinc-800/30 p-4">
                <h3 className="text-[14px] font-semibold text-zinc-400 mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {r.role}
                </h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{r.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
