type Props = {
  usage: {
    totalInputTokens: number;
    totalOutputTokens: number;
    avgInputTokens: number;
    avgOutputTokens: number;
    trackedRecs: number;
    estimatedCostUsd: number;
  };
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function UsagePanel({ usage }: Props) {
  const totalTokens = usage.totalInputTokens + usage.totalOutputTokens;

  const stats = [
    {
      label: "Total tokens",
      value: fmt(totalTokens),
      sub: `${fmt(usage.totalInputTokens)} in · ${fmt(usage.totalOutputTokens)} out`,
    },
    {
      label: "Avg per report",
      value: fmt(usage.avgInputTokens + usage.avgOutputTokens),
      sub: `${fmt(usage.avgInputTokens)} in · ${fmt(usage.avgOutputTokens)} out`,
    },
    {
      label: "Estimated cost",
      value: `$${usage.estimatedCostUsd.toFixed(4)}`,
      sub: `${usage.trackedRecs} tracked reports · claude-sonnet-4-6`,
    },
  ];

  return (
    <section>
      <h2 className="text-base font-semibold text-gray-900 mb-3">API Usage</h2>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            <p className="text-xs text-gray-300 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      {usage.trackedRecs === 0 && (
        <p className="text-xs text-gray-400 mt-2">
          Usage tracking applies to new reports only — existing records have no token data.
        </p>
      )}
    </section>
  );
}
