import Link from "next/link";
import type { RecommendationRow, DashboardProfile } from "@/lib/data/dashboard";
import type { ThreatLevelSnapshotRow } from "@/lib/data/threat-level";
import { ThreatWidget } from "@/components/threat-level/threat-widget";

const URGENCY_CONFIG = {
  now: { label: "Now", className: "bg-red-500/10 text-red-400 border border-red-500/20" },
  "6mo": { label: "6 mo", className: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  "1yr": { label: "1 yr", className: "bg-zinc-800 text-zinc-400 border border-zinc-700" },
};

export function QuickActions({
  recommendation,
  profile,
  threatSnapshot,
}: {
  recommendation: RecommendationRow | null;
  profile: DashboardProfile | null;
  threatSnapshot: ThreatLevelSnapshotRow | null;
}) {
  const topSkills = recommendation?.skillsToAccelerate.slice(0, 3) ?? [];
  const topRole = recommendation?.rolesToTarget[0] ?? null;
  const topIndustry = recommendation?.industriesToMoveToward[0] ?? null;

  return (
    <div className="flex flex-col gap-4">
      {/* Column header */}
      <div>
        <h2 className="text-[15px] font-semibold text-white tracking-[-0.01em]">Focus</h2>
        <p className="text-[13px] text-zinc-400 mt-0.5">Where to focus this week</p>
      </div>

      {/* Threat Level widget */}
      <ThreatWidget snapshot={threatSnapshot} />

      {/* Income goal */}
      {profile?.incomeGoal && (
        <div className="rounded-[10px] border border-zinc-800 p-4">
          <p className="label mb-1">Income Goal</p>
          <p className="text-[22px] font-semibold text-white tracking-[-0.02em]">
            ${profile.incomeGoal.toLocaleString()}
          </p>
          <p className="text-[12px] text-zinc-400 mt-0.5">annual target</p>
        </div>
      )}

      {recommendation ? (
        <>
          {/* Top skills */}
          {topSkills.length > 0 && (
            <div className="rounded-[10px] border border-zinc-800 p-4">
              <p className="label mb-3">Accelerate</p>
              <ul className="space-y-3">
                {topSkills.map((s, i) => {
                  const urgency = URGENCY_CONFIG[s.urgency] ?? URGENCY_CONFIG["1yr"];
                  return (
                    <li key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[14px] font-medium text-zinc-200">{s.skill}</span>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${urgency.className}`}>
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
              <p className="label mb-2">Role to research</p>
              <p className="text-[14px] font-semibold text-zinc-100 mb-1">{topRole.role}</p>
              <p className="text-[12px] text-zinc-500 leading-snug mb-2">{topRole.reason}</p>
              <span className="text-[11px] text-zinc-400">Horizon: {topRole.timeHorizon}</span>
            </div>
          )}

          {/* Industry */}
          {topIndustry && (
            <div className="rounded-[10px] border border-zinc-800 p-4">
              <p className="label mb-2">Industry to explore</p>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[14px] font-semibold text-zinc-100">{topIndustry.industry}</p>
                <span className="text-[11px] text-zinc-400">
                  {Math.round(topIndustry.confidence * 100)}%
                </span>
              </div>
              <p className="text-[12px] text-zinc-500 leading-snug">{topIndustry.reason}</p>
            </div>
          )}

          <Link
            href="/recommendations"
            className="block text-center text-[13px] font-medium text-zinc-500 hover:text-white border border-zinc-700 rounded-lg py-2.5 hover:bg-zinc-800 transition-all duration-150"
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
