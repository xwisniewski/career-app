type Props = {
  byCategory: { category: string; count: number }[];
  bySource: { source: string; count: number }[];
  byDay: { day: string; count: number }[];
};

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-36 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="bg-gray-900 h-2 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-700 w-8 text-right shrink-0">{value}</span>
    </div>
  );
}

export function SignalBreakdown({ byCategory, bySource, byDay }: Props) {
  const maxCat = Math.max(...byCategory.map((r) => r.count), 1);
  const maxSrc = Math.max(...bySource.map((r) => r.count), 1);

  // Simple sparkline: map day counts to SVG path
  const maxDay = Math.max(...byDay.map((r) => r.count), 1);
  const W = 300;
  const H = 48;
  const points = byDay.map((r, i) => {
    const x = byDay.length > 1 ? (i / (byDay.length - 1)) * W : W / 2;
    const y = H - Math.round((r.count / maxDay) * H);
    return `${x},${y}`;
  });
  const polyline = points.join(" ");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* By category */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 col-span-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">By category</p>
        <div className="space-y-3">
          {byCategory.map((r) => (
            <Bar key={r.category} label={r.category} value={r.count} max={maxCat} />
          ))}
          {byCategory.length === 0 && <p className="text-sm text-gray-400">No signals yet.</p>}
        </div>
      </div>

      {/* By source */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 col-span-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">By source</p>
        <div className="space-y-3">
          {bySource.map((r) => (
            <Bar key={r.source} label={r.source} value={r.count} max={maxSrc} />
          ))}
          {bySource.length === 0 && <p className="text-sm text-gray-400">No signals yet.</p>}
        </div>
      </div>

      {/* Signals over time */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 col-span-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Last 14 days
        </p>
        {byDay.length > 0 ? (
          <>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
              <polyline
                points={polyline}
                fill="none"
                stroke="#111827"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{byDay[0]?.day}</span>
              <span>{byDay[byDay.length - 1]?.day}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">No data yet.</p>
        )}
      </div>
    </div>
  );
}
