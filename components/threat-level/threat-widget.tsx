import Link from "next/link";
import type { ThreatLevelSnapshotRow } from "@/lib/data/threat-level";
import { ScoreDial } from "./score-dial";

type Props = {
  snapshot: ThreatLevelSnapshotRow | null;
};

export function ThreatWidget({ snapshot }: Props) {
  if (!snapshot) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
            Threat Level
          </span>
          <Link
            href="/threat-level"
            className="text-[11px] text-zinc-500 hover:text-white transition-colors"
          >
            Details →
          </Link>
        </div>
        <p className="text-[12px] text-zinc-500">
          Score not yet computed.{" "}
          <Link href="/threat-level" className="text-zinc-300 hover:text-white underline underline-offset-2">
            View details
          </Link>
        </p>
      </div>
    );
  }

  const deltaSign = snapshot.delta !== null && snapshot.delta > 0 ? "+" : "";
  const deltaColor =
    snapshot.delta === null
      ? "text-zinc-500"
      : snapshot.delta > 0
      ? "text-red-400"
      : snapshot.delta < 0
      ? "text-green-400"
      : "text-zinc-500";

  const topDrivers = snapshot.signalDrivers.slice(0, 3);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
          Threat Level
        </span>
        <Link
          href="/threat-level"
          className="text-[11px] text-zinc-500 hover:text-white transition-colors"
        >
          Details →
        </Link>
      </div>

      {/* Score + delta */}
      <div className="flex items-center gap-4 mb-4">
        <ScoreDial score={snapshot.score} size="sm" />
        <div>
          {snapshot.delta !== null && (
            <p className={`text-[12px] font-medium ${deltaColor}`}>
              {deltaSign}{snapshot.delta} pts today
            </p>
          )}
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Updated {new Date(snapshot.computedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Top 3 drivers */}
      {topDrivers.length > 0 && (
        <div className="space-y-1.5">
          {topDrivers.map((d) => (
            <div key={d.signalId} className="flex items-start gap-2">
              <span className="text-[10px] font-bold text-red-400 shrink-0 mt-px">
                +{d.contribution}
              </span>
              <p className="text-[11px] text-zinc-400 leading-snug line-clamp-1">{d.headline}</p>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/threat-level"
        className="mt-3 block text-center text-[11px] text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded-md py-1.5 transition-all"
      >
        Full breakdown
      </Link>
    </div>
  );
}
