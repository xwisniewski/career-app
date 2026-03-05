import Link from "next/link";
import type { SignalDetail } from "@/lib/data/signals";

const SENTIMENT_DOT: Record<string, string> = {
  POSITIVE: "bg-emerald-500",
  NEGATIVE: "bg-red-500",
  NEUTRAL: "bg-amber-400",
};

const CATEGORY_LABEL: Record<string, string> = {
  JOB_MARKET: "Jobs",
  CAPITAL_FLOWS: "Capital",
  SKILL_DEMAND: "Skills",
  DISPLACEMENT_RISK: "Risk",
  POLICY: "Policy",
};

export function TrendingStrip({ signals }: { signals: SignalDetail[] }) {
  if (signals.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
        Trending this week
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {signals.map((s) => (
          <Link
            key={s.id}
            href={`/signals/${s.id}`}
            className="flex-shrink-0 w-56 bg-zinc-900 rounded-lg border border-zinc-800 p-3 hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`w-1.5 h-1.5 rounded-full ${SENTIMENT_DOT[s.sentiment]}`} />
              <span className="text-xs text-zinc-500">
                {CATEGORY_LABEL[s.category] ?? s.category}
              </span>
              {/* Magnitude */}
              <div className="ml-auto flex gap-0.5">
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className={`w-0.5 h-2.5 rounded-sm ${n <= s.magnitude ? "bg-zinc-300" : "bg-zinc-700"}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs font-medium text-zinc-200 leading-snug line-clamp-2">
              {s.headline}
            </p>
            <p className="text-xs text-zinc-400 mt-1.5 font-mono">{s.source}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
