import Link from "next/link";
import type { ThreatLevelSnapshotRow, SparklinePoint } from "@/lib/data/threat-level";
import { ScoreDial } from "./score-dial";
import { ThreatSparkline } from "./sparkline";

type Props = {
  snapshot: ThreatLevelSnapshotRow | null;
  sparklineData?: SparklinePoint[];
};

function buildLinkedInShareUrl(userId: string, score: number) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://career-app-bice.vercel.app";
  const cardUrl = `${appUrl}/api/og/card?uid=${encodeURIComponent(userId)}`;
  const summary = [
    `My career threat level is ${score}/100 according to live macro data.`,
    "",
    "Trajectory.io reads public economic signals and turns them into career guidance.",
  ].join("\n");

  return `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({
    url: cardUrl,
    summary,
  }).toString()}`;
}

export function ThreatWidget({ snapshot, sparklineData = [] }: Props) {
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

      {/* 30-day sparkline */}
      {sparklineData.length >= 2 && (
        <div className="mt-3">
          <ThreatSparkline data={sparklineData} height={36} />
        </div>
      )}

      <Link
        href="/threat-level"
        className="mt-3 block text-center text-[11px] text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded-md py-1.5 transition-all"
      >
        Full breakdown
      </Link>

      <a
        href={buildLinkedInShareUrl(snapshot.userId, snapshot.score)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-[12px] font-medium text-blue-300 transition-all duration-150 hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-white"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 shrink-0 fill-current"
          aria-hidden="true"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        Share to LinkedIn
      </a>
    </div>
  );
}
