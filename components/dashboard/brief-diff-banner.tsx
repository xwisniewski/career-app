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
  const MAX_VISIBLE = 5;
  const hiddenCount = Math.max(0, visibleRows.length - MAX_VISIBLE);

  return (
    <div
      className="rounded-[10px] border"
      style={{
        borderColor: "rgb(var(--accent-line))",
        backgroundColor: "rgb(var(--accent-soft))",
      }}
    >
      <div
        className="flex items-center justify-between gap-3 border-b px-4 py-2.5"
        style={{ borderColor: "rgb(var(--accent-line))" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ backgroundColor: "rgb(var(--accent))" }}
          />
          <p
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "rgb(var(--accent))" }}
          >
            Diff · what changed
          </p>
          {diff.previousGeneratedAt && (
            <span className="font-mono text-[10px] tracking-wider text-zinc-500">
              vs {timeAgo(diff.previousGeneratedAt)}
            </span>
          )}
        </div>
        <span
          className="num font-mono text-[10px] tracking-wider"
          style={{ color: "rgb(var(--accent))" }}
        >
          {visibleRows.length}
        </span>
      </div>

      <ol className="divide-y divide-zinc-800/60">
        {visibleRows.slice(0, MAX_VISIBLE).map((row, i) => (
          <li key={`${row.label}-${i}`} className="px-4 py-3">
            <div className="mb-1 flex items-center gap-2">
              <span
                className={`font-mono text-[11px] font-bold leading-none ${
                  row.kind === "added" ? "text-emerald-400" : "text-zinc-500"
                }`}
              >
                {row.kind === "added" ? "+" : "−"}
              </span>
              <span
                className={`font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  row.kind === "added" ? "text-emerald-400" : "text-zinc-500"
                }`}
              >
                {row.label}
              </span>
              <span className="font-mono text-[10px] tracking-wider text-zinc-600">
                · {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <p
              className="pl-[18px] text-[12.5px] leading-[1.55] text-zinc-300"
              style={{ textWrap: "pretty" }}
            >
              {row.item}
            </p>
          </li>
        ))}
      </ol>

      {hiddenCount > 0 && (
        <div
          className="border-t px-4 py-2"
          style={{ borderColor: "rgb(var(--accent-line))" }}
        >
          <p
            className="font-mono text-[10px] tracking-wider"
            style={{ color: "rgb(var(--accent))" }}
          >
            + {hiddenCount} more in full report →
          </p>
        </div>
      )}
    </div>
  );
}
