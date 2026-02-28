type Props = {
  totals: { signals: number; recommendations: number; users: number };
};

export function StatsBar({ totals }: Props) {
  const stats = [
    { label: "Total signals", value: totals.signals.toLocaleString() },
    { label: "Recommendations generated", value: totals.recommendations.toLocaleString() },
    { label: "Users", value: totals.users.toLocaleString() },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          <p className="text-sm text-gray-400 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
