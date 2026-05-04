import type { BriefDiff } from "@/lib/data/brief-diff";

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

  const visibleRows = rows.flatMap((row) =>
    row.items.map((item) => ({ label: row.label, kind: row.kind, item }))
  );
  const hiddenCount = Math.max(0, visibleRows.length - 6);

  return (
    <div
      className="rounded-[10px] border p-4"
      style={{
        borderColor: "rgb(var(--accent-line))",
        backgroundColor: "rgb(var(--accent-soft))",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "rgb(var(--accent))" }}
        />
        <p
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "rgb(var(--accent))" }}
        >
          Diff · what changed
          {diff.previousGeneratedAt && (
            <span className="ml-1.5 font-normal text-zinc-500">
              vs {timeAgo(diff.previousGeneratedAt)}
            </span>
          )}
        </p>
      </div>
      <ul className="space-y-1.5">
        {visibleRows.slice(0, 6).map((row, i) => (
          <li key={`${row.label}-${i}`} className="flex items-start gap-2.5">
            <span
              className={`font-mono text-[11px] font-bold shrink-0 mt-px ${
                row.kind === "added" ? "text-emerald-400" : "text-zinc-500"
              }`}
            >
              {row.kind === "added" ? "+" : "−"}
            </span>
            <span className="line-clamp-2 text-[12px] text-zinc-300 leading-snug">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mr-1.5">
                {row.label}
              </span>
              {row.item}
            </span>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <p
          className="mt-2 font-mono text-[10px] tracking-wider"
          style={{ color: "rgb(var(--accent))" }}
        >
          + {hiddenCount} more in full report
        </p>
      )}
    </div>
  );
}
