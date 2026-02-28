type Bucket = { label: string; count: number };

export function DistributionChart({ buckets }: { buckets: Bucket[] }) {
  const peak = Math.max(...buckets.map((b) => b.count), 1);
  const total = buckets.reduce((s, b) => s + b.count, 0);

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-400">
        No data yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      {buckets.map((bucket) => {
        const barPct = Math.round((bucket.count / peak) * 100);
        const sharePct = total > 0 ? Math.round((bucket.count / total) * 100) : 0;
        return (
          <div key={bucket.label} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-28 shrink-0">{bucket.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-0">
              <div className="bg-gray-700 h-2 rounded-full" style={{ width: `${barPct}%` }} />
            </div>
            <span className="text-xs text-gray-400 w-10 text-right shrink-0">
              {bucket.count > 0 ? `${sharePct}%` : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
