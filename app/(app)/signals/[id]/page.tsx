import Link from "next/link";
import { notFound } from "next/navigation";
import { getSignalById } from "@/lib/data/signals";

const SENTIMENT_CONFIG = {
  POSITIVE: { badge: "bg-green-50 text-green-700 border-green-100", label: "Opportunity" },
  NEGATIVE: { badge: "bg-red-50 text-red-700 border-red-100", label: "Risk" },
  NEUTRAL: { badge: "bg-yellow-50 text-yellow-700 border-yellow-100", label: "Watch" },
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
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6"
      >
        ← Back to signals
      </Link>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sentiment.badge}`}>
            {sentiment.label}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {CATEGORY_LABEL[signal.category] ?? signal.category}
          </span>
          <span className="text-xs text-gray-400 font-mono">{signal.source}</span>
          <span className="text-xs text-gray-400 ml-auto">{timeAgo(signal.scrapedAt)}</span>
        </div>

        {/* Headline */}
        <h1 className="text-xl font-semibold text-gray-900 mb-4 leading-snug">
          {signal.headline}
        </h1>

        {/* Data point */}
        <div className="bg-gray-50 rounded-lg p-4 mb-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
            Data Point
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{signal.dataPoint}</p>
        </div>

        {/* Magnitude */}
        <div className="flex items-center gap-3 mb-5">
          <p className="text-xs font-medium text-gray-500">Signal strength</p>
          <div className="flex gap-1">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`w-2 h-5 rounded-sm ${n <= signal.magnitude ? "bg-gray-800" : "bg-gray-200"}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">{signal.magnitude}/3</span>
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
        <div className="mt-5 pt-4 border-t border-gray-100">
          <a
            href={signal.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            View original source ↗
          </a>
          <span className="text-xs text-gray-400 ml-2 font-mono">{signal.topic}</span>
        </div>
      </div>

      {/* Raw content */}
      {signal.rawContent && (
        <details className="mb-6 bg-white rounded-xl border border-gray-200">
          <summary className="px-6 py-4 text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
            Raw content
          </summary>
          <div className="px-6 pb-5">
            <pre className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto">
              {signal.rawContent}
            </pre>
          </div>
        </details>
      )}

      {/* Related signals */}
      {related.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Related signals</h2>
          <div className="flex flex-col gap-3">
            {related.map((r) => {
              const cfg = SENTIMENT_CONFIG[r.sentiment];
              return (
                <Link
                  key={r.id}
                  href={`/signals/${r.id}`}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-gray-400 font-mono ml-auto">{r.source}</span>
                    <span className="text-xs text-gray-400">{timeAgo(r.scrapedAt)}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 leading-snug">{r.headline}</p>
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
      <span className="text-xs text-gray-400 w-16 shrink-0 pt-0.5">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
