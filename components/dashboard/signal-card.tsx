import type { SignalRow } from "@/lib/data/dashboard";

const SENTIMENT_CONFIG = {
  POSITIVE: { dot: "bg-green-500", badge: "bg-green-50 text-green-700", label: "Opportunity" },
  NEGATIVE: { dot: "bg-red-500", badge: "bg-red-50 text-red-700", label: "Risk" },
  NEUTRAL: { dot: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700", label: "Watch" },
};

const CATEGORY_LABEL: Record<string, string> = {
  JOB_MARKET: "Job Market",
  CAPITAL_FLOWS: "Capital",
  SKILL_DEMAND: "Skills",
  DISPLACEMENT_RISK: "Displacement",
  POLICY: "Policy",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SignalCard({ signal }: { signal: SignalRow }) {
  const cfg = SENTIMENT_CONFIG[signal.sentiment];

  return (
    <a
      href={signal.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all group"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
          <span className="text-xs text-gray-400 truncate">
            {CATEGORY_LABEL[signal.category] ?? signal.category}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Magnitude bars */}
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`w-1 h-3 rounded-sm ${n <= signal.magnitude ? "bg-gray-700" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>

      {/* Headline */}
      <p className="text-sm font-medium text-gray-900 mb-1 group-hover:text-gray-700 leading-snug">
        {signal.headline}
      </p>

      {/* Data point */}
      <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">
        {signal.dataPoint}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-mono">{signal.source}</span>
        <span className="text-xs text-gray-400">{timeAgo(signal.scrapedAt)}</span>
      </div>
    </a>
  );
}
