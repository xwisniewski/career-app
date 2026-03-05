import Link from "next/link";
import { notFound } from "next/navigation";
import { getSignalById } from "@/lib/data/signals";

const SENTIMENT_CONFIG = {
  POSITIVE: { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Opportunity" },
  NEGATIVE: { badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "Risk" },
  NEUTRAL: { badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Watch" },
};

const CATEGORY_LABEL: Record<string, string> = {
  JOB_MARKET: "Job Market",
  CAPITAL_FLOWS: "Capital Flows",
  SKILL_DEMAND: "Skill Demand",
  DISPLACEMENT_RISK: "Displacement Risk",
  POLICY: "Policy",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function SignalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { signal, related } = await getSignalById(id);

  if (!signal) notFound();

  const sentiment = SENTIMENT_CONFIG[signal.sentiment];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href="/signals"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        ← Back to signals
      </Link>

      {/* Main card */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sentiment.badge}`}>
            {sentiment.label}
          </span>
          <span className="text-xs text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full">
            {CATEGORY_LABEL[signal.category] ?? signal.category}
          </span>
          <span className="text-xs text-zinc-400 font-mono">{signal.source}</span>
          <span className="text-xs text-zinc-500 ml-auto">{timeAgo(signal.scrapedAt)}</span>
        </div>

        {/* Headline */}
        <h1 className="text-xl font-semibold text-zinc-100 mb-4 leading-snug">
          {signal.headline}
        </h1>

        {/* Data point */}
        <div className="bg-zinc-800/60 rounded-lg p-4 mb-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
            Data Point
          </p>
          <p className="text-sm text-zinc-300 leading-relaxed">{signal.dataPoint}</p>
        </div>

        {/* Magnitude */}
        <div className="flex items-center gap-3 mb-5">
          <p className="text-xs font-medium text-zinc-500">Signal strength</p>
          <div className="flex gap-1">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`w-2 h-5 rounded-sm ${n <= signal.magnitude ? "bg-zinc-300" : "bg-zinc-700"}`}
              />
            ))}
          </div>
          <span className="text-xs text-zinc-400">{signal.magnitude}/3</span>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-3">
          {signal.relevantIndustries.length > 0 && (
            <TagRow label="Industries" tags={signal.relevantIndustries} />
          )}
          {signal.relevantRoles.length > 0 && (
            <TagRow label="Roles" tags={signal.relevantRoles} />
          )}
          {signal.relevantSkills.length > 0 && (
            <TagRow label="Skills" tags={signal.relevantSkills} />
          )}
        </div>

        {/* Source link */}
        <div className="mt-5 pt-4 border-t border-zinc-800">
          <a
            href={signal.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors font-medium"
          >
            View original source ↗
          </a>
          <span className="text-xs text-zinc-500 ml-2 font-mono">{signal.topic}</span>
        </div>
      </div>

      {/* Raw content */}
      {signal.rawContent && (
        <details className="mb-6 bg-zinc-900 rounded-xl border border-zinc-800">
          <summary className="px-6 py-4 text-sm font-medium text-zinc-400 cursor-pointer hover:text-zinc-200">
            Raw content
          </summary>
          <div className="px-6 pb-5">
            <pre className="text-xs text-zinc-500 whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto">
              {signal.rawContent}
            </pre>
          </div>
        </details>
      )}

      {/* Related signals */}
      {related.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3">Related signals</h2>
          <div className="flex flex-col gap-3">
            {related.map((r) => {
              const cfg = SENTIMENT_CONFIG[r.sentiment];
              return (
                <Link
                  key={r.id}
                  href={`/signals/${r.id}`}
                  className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono ml-auto">{r.source}</span>
                    <span className="text-xs text-zinc-400">{timeAgo(r.scrapedAt)}</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-200 leading-snug">{r.headline}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TagRow({ label, tags }: { label: string; tags: string[] }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-zinc-500 w-16 shrink-0 pt-0.5">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
