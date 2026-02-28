import type { FullRecommendation } from "@/lib/data/recommendations";

export function RolesSection({ rec }: { rec: FullRecommendation }) {
  return (
    <section id="roles" className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Role Intelligence</h2>
        <p className="text-sm text-gray-400 mt-0.5">Where to move, what to exit.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target roles */}
        {rec.rolesToTarget.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
              Target
            </p>
            {rec.rolesToTarget.map((r, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">{r.role}</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded shrink-0">
                    {r.timeHorizon}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{r.reason}</p>
              </div>
            ))}
          </div>
        )}

        {/* Avoid roles */}
        {rec.rolesToAvoid.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">
              Avoid / Exit
            </p>
            {rec.rolesToAvoid.map((r, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-red-100 p-4"
              >
                <h3 className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {r.role}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{r.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
