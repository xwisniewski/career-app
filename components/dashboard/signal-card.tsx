import type { SignalRow } from "@/lib/data/dashboard";

const SENTIMENT_CONFIG = {
  POSITIVE: { color: "text-emerald-400", bar: "bg-emerald-400", label: "OPP" },
  NEGATIVE: { color: "text-red-400", bar: "bg-red-400", label: "RISK" },
  NEUTRAL:  { color: "text-amber-400", bar: "bg-amber-400", label: "WATCH" },
};

const CATEGORY_LABEL: Record<string, string> = {
  JOB_MARKET: "JOBS",
  CAPITAL_FLOWS: "CAPITAL",
  SKILL_DEMAND: "SKILLS",
  DISPLACEMENT_RISK: "RISK·AI",
  POLICY: "POLICY",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

/**
 * Dense terminal-style signal row.
 * Replaces the previous card layout — same data, ~50% less vertical space.
 */
export function SignalCard({ signal }: { signal: SignalRow }) {
  const cfg = SENTIMENT_CONFIG[signal.sentiment];
  const cat = CATEGORY_LABEL[signal.category] ?? signal.category;

  return (
    <a
      href={signal.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border-b border-zinc-800/80 px-3 py-2.5 transition-colors duration-150 hover:bg-zinc-900/60"
    >
      <div className="grid grid-cols-[44px_56px_1fr_auto] items-center gap-2.5">
        {/* Tone tag */}
        <span className={`font-mono text-[10px] font-semibold tracking-[0.14em] ${cfg.color}`}>
          {cfg.label}
        </span>

        {/* Category code */}
        <span className="font-mono text-[10px] tracking-[0.12em] text-zinc-500">
          {cat}
        </span>

        {/* Headline + source */}
        <div className="min-w-0">
          <p className="truncate text-[13.5px] leading-snug text-zinc-100 group-hover:text-white">
            {signal.headline}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10px] tracking-wider text-zinc-500">
            {signal.source} · {timeAgo(signal.scrapedAt)}
          </p>
        </div>

        {/* Magnitude bars */}
        <div className="flex items-center gap-[2px] shrink-0">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-3 w-[3px] ${n <= signal.magnitude ? cfg.bar : "bg-zinc-800"}`}
            />
          ))}
        </div>
      </div>

      {/* Data point — only on hover for density, but always for accessibility/legibility */}
      <p className="mt-1.5 ml-[112px] line-clamp-1 text-[12px] leading-snug text-zinc-500">
        {signal.dataPoint}
      </p>
    </a>
  );
}
