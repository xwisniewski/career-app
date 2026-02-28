import Link from "next/link";
import type { RecommendationRow, DashboardProfile } from "@/lib/data/dashboard";

const URGENCY_CONFIG = {
  now: { label: "Now", className: "bg-red-100 text-red-700" },
  "6mo": { label: "6 mo", className: "bg-yellow-100 text-yellow-700" },
  "1yr": { label: "1 yr", className: "bg-gray-100 text-gray-600" },
};

export function QuickActions({
  recommendation,
  profile,
}: {
  recommendation: RecommendationRow | null;
  profile: DashboardProfile | null;
}) {
  const topSkills = recommendation?.skillsToAccelerate.slice(0, 3) ?? [];
  const topRole = recommendation?.rolesToTarget[0] ?? null;
  const topIndustry = recommendation?.industriesToMoveToward[0] ?? null;

  return (
    <div className="flex flex-col gap-4">
      {/* Column header */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
        <p className="text-xs text-gray-400 mt-0.5">Where to focus this week</p>
      </div>

      {/* Income goal tracker */}
      {profile?.incomeGoal && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Income Goal</p>
          <p className="text-xl font-bold text-gray-900">
            ${profile.incomeGoal.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">annual target</p>
        </div>
      )}

      {recommendation ? (
        <>
          {/* Top skills */}
          {topSkills.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Skills to accelerate
              </p>
              <ul className="space-y-3">
                {topSkills.map((s, i) => {
                  const urgency = URGENCY_CONFIG[s.urgency] ?? URGENCY_CONFIG["1yr"];
                  return (
                    <li key={i}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-medium text-gray-800">{s.skill}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${urgency.className}`}>
                          {urgency.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-snug">{s.reason}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Role to research */}
          {topRole && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Role to research
              </p>
              <p className="text-sm font-semibold text-gray-900 mb-1">{topRole.role}</p>
              <p className="text-xs text-gray-500 leading-snug mb-2">{topRole.reason}</p>
              <span className="text-xs text-gray-400">Target horizon: {topRole.timeHorizon}</span>
            </div>
          )}

          {/* Industry to explore */}
          {topIndustry && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Industry to explore
              </p>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-900">{topIndustry.industry}</p>
                <span className="text-xs text-gray-400">
                  {Math.round(topIndustry.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-snug">{topIndustry.reason}</p>
            </div>
          )}

          <Link
            href="/recommendations"
            className="block text-center text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
          >
            Full report →
          </Link>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Quick actions will appear here once your first intelligence brief is generated.
          </p>
          <Link
            href="/recommendations"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 underline"
          >
            View recommendations →
          </Link>
        </div>
      )}
    </div>
  );
}
