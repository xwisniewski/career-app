import type { BriefDiff } from "@/lib/data/dashboard";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function BriefDiffBanner({ diff }: { diff: BriefDiff }) {
  const rows: { label: string; items: string[]; kind: "added" | "removed" }[] = (
    [
      { label: "New opportunity", items: diff.newOpportunities, kind: "added" },
      { label: "New risk", items: diff.newRisks, kind: "added" },
      { label: "New skill", items: diff.newSkills, kind: "added" },
      { label: "Opportunity resolved", items: diff.removedOpportunities, kind: "removed" },
      { label: "Risk resolved", items: diff.removedRisks, kind: "removed" },
      { label: "Skill deprioritised", items: diff.removedSkills, kind: "removed" },
    ] as { label: string; items: string[]; kind: "added" | "removed" }[]
  ).filter((r) => r.items.length > 0);

  if (rows.length === 0) return null;

  return (
    <div className="rounded-[10px] border border-blue-500/20 bg-blue-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
        <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
          What changed
          {diff.previousGeneratedAt && (
            <span className="font-normal text-blue-400/60 ml-1">
              since {timeAgo(diff.previousGeneratedAt)}
            </span>
          )}
        </p>
      </div>
      <ul className="space-y-1.5">
        {rows.map((row) =>
          row.items.map((item, i) => (
            <li key={`${row.label}-${i}`} className="flex items-start gap-2">
              <span
                className={`text-[11px] font-bold shrink-0 mt-px ${
                  row.kind === "added" ? "text-emerald-400" : "text-zinc-500"
                }`}
              >
                {row.kind === "added" ? "+" : "−"}
              </span>
              <span className="text-[12px] text-zinc-300 leading-snug">
                <span className="text-zinc-500">{row.label}: </span>
                {item}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
