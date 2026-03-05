import type { SignalRow } from "@/lib/data/dashboard";

const SENTIMENT_CONFIG = {
  POSITIVE: { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", label: "Opportunity" },
  NEGATIVE: { dot: "bg-red-500", badge: "bg-red-500/10 text-red-400 border border-red-500/20", label: "Risk" },
  NEUTRAL: { dot: "bg-amber-400", badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20", label: "Watch" },
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
      className="block p-4 rounded-[10px] border border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all duration-150 group"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
          <span className="text-[11px] text-zinc-400 truncate">
            {CATEGORY_LABEL[signal.category] ?? signal.category}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`w-[3px] h-3 rounded-full ${n <= signal.magnitude ? "bg-zinc-300" : "bg-zinc-700"}`}
            />
          ))}
        </div>
      </div>

      {/* Headline */}
      <p className="text-[14px] font-medium text-zinc-100 mb-1.5 leading-snug group-hover:text-white transition-colors duration-150">
        {signal.headline}
      </p>

      {/* Data point */}
      <p className="text-[13px] text-zinc-500 mb-3 leading-relaxed line-clamp-2">
        {signal.dataPoint}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800">
        <span className="text-[11px] text-zinc-400 font-mono">{signal.source}</span>
        <span className="text-[11px] text-zinc-400">{timeAgo(signal.scrapedAt)}</span>
      </div>
    </a>
  );
}
