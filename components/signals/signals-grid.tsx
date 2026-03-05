import Link from "next/link";
import type { SignalDetail } from "@/lib/data/signals";

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
  return `${Math.floor(hours / 24)}d ago`;
}

function SignalGridCard({ signal }: { signal: SignalDetail }) {
  const cfg = SENTIMENT_CONFIG[signal.sentiment];

  return (
    <div className="bg-zinc-900 rounded-[10px] border border-zinc-800 p-4 flex flex-col gap-2 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all duration-150">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <span className="text-[11px] text-zinc-400 truncate">
          {CATEGORY_LABEL[signal.category] ?? signal.category}
        </span>
        <div className="flex gap-0.5 shrink-0">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`w-1 h-3 rounded-sm ${n <= signal.magnitude ? "bg-zinc-300" : "bg-zinc-700"}`}
            />
          ))}
        </div>
      </div>

      {/* Headline — links to detail page */}
      <Link href={`/signals/${signal.id}`} className="group">
        <p className="text-[14px] font-medium text-zinc-100 leading-snug group-hover:text-white transition-colors duration-150">
          {signal.headline}
        </p>
      </Link>

      {/* Data point */}
      <p className="text-[13px] text-zinc-500 leading-relaxed line-clamp-2 flex-1">
        {signal.dataPoint}
      </p>

      {/* Tags */}
      {(signal.relevantIndustries.length > 0 || signal.relevantSkills.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {[...signal.relevantIndustries, ...signal.relevantSkills].slice(0, 4).map((tag) => (
            <span key={tag} className="text-[11px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-800 mt-auto">
        <span className="text-[11px] text-zinc-400 font-mono">{signal.source}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-400">{timeAgo(signal.scrapedAt)}</span>
          <a
            href={signal.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors duration-150"
          >
            ↗
          </a>
        </div>
      </div>
    </div>
  );
}

export function SignalsGrid({
  signals,
  total,
  page,
  totalPages,
}: {
  signals: SignalDetail[];
  total: number;
  page: number;
  totalPages: number;
}) {
  if (signals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
          <span className="w-2 h-2 rounded-full bg-zinc-600" />
        </div>
        <p className="text-[14px] font-medium text-zinc-300">No signals found</p>
        <p className="text-[13px] text-zinc-400 mt-1">
          Try different filters, or check back after the scraping jobs run.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[13px] text-zinc-400 mb-4">
        {total.toLocaleString()} signal{total !== 1 ? "s" : ""}
        {totalPages > 1 && ` · page ${page} of ${totalPages}`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {signals.map((s) => (
          <SignalGridCard key={s.id} signal={s} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
    </div>
  );
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const pages = buildPageRange(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1">
      <PaginationLink page={page - 1} disabled={page <= 1} label="←" />
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 py-1 text-[14px] text-zinc-400">
            …
          </span>
        ) : (
          <PaginationLink key={p} page={p as number} current={p === page} label={String(p)} />
        )
      )}
      <PaginationLink page={page + 1} disabled={page >= totalPages} label="→" />
    </div>
  );
}

function PaginationLink({
  page,
  label,
  current,
  disabled,
}: {
  page: number;
  label: string;
  current?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="px-3 py-1.5 rounded text-[14px] text-zinc-300 cursor-not-allowed">{label}</span>
    );
  }
  return (
    <a
      href={`?page=${page}`}
      className={`px-3 py-1.5 rounded text-[14px] transition-colors duration-150 ${
        current
          ? "bg-zinc-700 text-white font-medium"
          : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
      }`}
    >
      {label}
    </a>
  );
}

function buildPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}
