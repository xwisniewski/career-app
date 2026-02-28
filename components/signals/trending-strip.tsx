import Link from "next/link";
import type { SignalDetail } from "@/lib/data/signals";

const SENTIMENT_DOT: Record<string, string> = {
  POSITIVE: "bg-green-500",
  NEGATIVE: "bg-red-500",
  NEUTRAL: "bg-yellow-400",
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
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Trending this week
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {signals.map((s) => (
          <Link
            key={s.id}
            href={`/signals/${s.id}`}
            className="flex-shrink-0 w-56 bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`w-1.5 h-1.5 rounded-full ${SENTIMENT_DOT[s.sentiment]}`} />
              <span className="text-xs text-gray-400">
                {CATEGORY_LABEL[s.category] ?? s.category}
              </span>
              {/* Magnitude */}
              <div className="ml-auto flex gap-0.5">
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className={`w-0.5 h-2.5 rounded-sm ${n <= s.magnitude ? "bg-gray-600" : "bg-gray-200"}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs font-medium text-gray-800 leading-snug line-clamp-2">
              {s.headline}
            </p>
            <p className="text-xs text-gray-400 mt-1.5 font-mono">{s.source}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
