type Item = { label: string; count: number };

export function FrequencyChart({
  items,
  emptyMessage,
}: {
  items: Item[];
  max?: number;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  const peak = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      {items.map((item) => {
        const pct = Math.round((item.count / peak) * 100);
        return (
          <div key={item.label} className="flex items-center gap-3">
            <span
              className="text-sm text-gray-700 w-36 shrink-0 truncate"
              title={item.label}
            >
              {item.label}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-0">
              <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-400 w-6 text-right shrink-0">
              {item.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
