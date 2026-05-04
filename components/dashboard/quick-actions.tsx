import Link from "next/link";
import type { RecommendationRow, DashboardProfile } from "@/lib/data/dashboard";
import type { ThreatLevelSnapshotRow, SparklinePoint } from "@/lib/data/threat-level";
import { ThreatWidget } from "@/components/threat-level/threat-widget";

const URGENCY_CONFIG = {
  now: { label: "NOW", className: "bg-red-500/10 text-red-400 border border-red-500/20" },
  "6mo": { label: "6 MO", className: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  "1yr": { label: "1 YR", className: "bg-zinc-800 text-zinc-400 border border-zinc-700" },
};

export function QuickActions({
  recommendation,
  profile,
  threatSnapshot,
  sparklineData = [],
}: {
  recommendation: RecommendationRow | null;
  profile: DashboardProfile | null;
  threatSnapshot: ThreatLevelSnapshotRow | null;
  sparklineData?: SparklinePoint[];
}) {
  const topSkills = recommendation?.skillsToAccelerate.slice(0, 3) ?? [];
  const topRole = recommendation?.rolesToTarget[0] ?? null;
  const topIndustry = recommendation?.industriesToMoveToward[0] ?? null;

  return (
    <div className="flex flex-col gap-4">
      {/* Column header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="eyebrow">Focus · this week</span>
        </div>
      </div>

      {/* Threat Level widget */}
      <ThreatWidget snapshot={threatSnapshot} sparklineData={sparklineData} />

      {/* Income goal */}
      {profile?.incomeGoal && (
        <div className="rounded-[10px] border border-zinc-800 p-4">
          <p className="eyebrow mb-1.5">Income · goal</p>
          <p
            className="num text-[24px] font-semibold tracking-[-0.02em]"
            style={{ color: "rgb(var(--accent))" }}
          >
            ${profile.incomeGoal.toLocaleString()}
          </p>
          <p className="font-mono text-[10px] tracking-wider text-zinc-500 mt-1">
            ANNUAL · TARGET
          </p>
        </div>
      )}

      {recommendation ? (
        <>
          {/* Top skills */}
          {topSkills.length > 0 && (
            <div className="rounded-[10px] border border-zinc-800 p-4">
              <p className="eyebrow mb-3">Accelerate</p>
              <ul className="space-y-3">
                {topSkills.map((s, i) => {
                  const urgency = URGENCY_CONFIG[s.urgency] ?? URGENCY_CONFIG["1yr"];
                  return (
                    <li key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[14px] font-medium text-zinc-200">{s.skill}</span>
                        <span
                          className={`font-mono text-[10px] tracking-wider px-1.5 py-0.5 rounded font-semibold ${urgency.className}`}
                        >
                          {urgency.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-zinc-500 leading-snug">{s.reason}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Role */}
          {topRole && (
            <div className="rounded-[10px] border border-zinc-800 p-4">
              <p className="eyebrow mb-2">Role · research</p>
              <p className="text-[14px] font-semibold text-zinc-100 mb-1">{topRole.role}</p>
              <p className="text-[12px] text-zinc-500 leading-snug mb-2">{topRole.reason}</p>
              <span className="font-mono text-[10px] tracking-wider text-zinc-400">
                HORIZON · {topRole.timeHorizon.toUpperCase()}
              </span>
            </div>
          )}

          {/* Industry */}
          {topIndustry && (
            <div className="rounded-[10px] border border-zinc-800 p-4">
              <p className="eyebrow mb-2">Industry · explore</p>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[14px] font-semibold text-zinc-100">{topIndustry.industry}</p>
                <span className="font-mono text-[10px] num tracking-wider text-zinc-400">
                  {Math.round(topIndustry.confidence * 100)}%
                </span>
              </div>
              <p className="text-[12px] text-zinc-500 leading-snug">{topIndustry.reason}</p>
            </div>
          )}

          <Link
            href="/recommendations"
            className="block text-center text-[12px] font-mono uppercase tracking-[0.14em] text-zinc-400 hover:text-white border border-zinc-800 rounded-[10px] py-3 hover:bg-zinc-900 transition-all duration-150"
          >
            Full report →
          </Link>
        </>
      ) : (
        <div className="rounded-[10px] border border-zinc-800 p-5 text-center">
          <p className="text-[13px] text-zinc-500 mb-3 leading-relaxed">
            Actions appear once your first brief is generated.
          </p>
          <Link
            href="/recommendations"
            className="text-[13px] font-medium text-zinc-400 hover:text-white underline transition-all duration-150"
          >
            View recommendations →
          </Link>
        </div>
      )}
    </div>
  );
}
