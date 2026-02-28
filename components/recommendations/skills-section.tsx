"use client";

import dynamic from "next/dynamic";
import type { FullRecommendation, RecommendationProfile } from "@/lib/data/recommendations";

const SkillsRadar = dynamic(
  () => import("./skills-radar").then((m) => m.SkillsRadar),
  { ssr: false, loading: () => <div className="h-64 bg-gray-50 rounded-lg animate-pulse" /> }
);

const URGENCY = {
  now: { label: "Now", className: "bg-red-100 text-red-700" },
  "6mo": { label: "6 mo", className: "bg-yellow-100 text-yellow-700" },
  "1yr": { label: "1 yr", className: "bg-gray-100 text-gray-600" },
};

type Props = {
  rec: FullRecommendation;
  profile: RecommendationProfile;
};

export function SkillsSection({ rec, profile }: Props) {
  // Build radar data: current skills + derived recommended levels
  const accelerateMap = new Map(
    rec.skillsToAccelerate.map((s) => [s.skill.toLowerCase(), s.urgency])
  );
  const deprioritizeSet = new Set(rec.skillsToDeprioritize.map((s) => s.skill.toLowerCase()));

  const radarData = profile.primarySkills.slice(0, 10).map((s) => {
    const urgency = accelerateMap.get(s.name.toLowerCase());
    let recommended = s.proficiencyLevel;
    if (urgency === "now") recommended = Math.min(5, s.proficiencyLevel + 2);
    else if (urgency) recommended = Math.min(5, s.proficiencyLevel + 1);
    else if (deprioritizeSet.has(s.name.toLowerCase())) recommended = Math.max(1, s.proficiencyLevel - 1);
    return { skill: s.name, current: s.proficiencyLevel, recommended };
  });

  return (
    <section id="skills" className="flex flex-col gap-6">
      <SectionHeader
        label="Skills Radar"
        description="What to build, what to dial back, what to watch."
      />

      {/* Radar chart */}
      {radarData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
            Current vs. recommended skill levels
          </p>
          <SkillsRadar data={radarData} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Accelerate */}
        {rec.skillsToAccelerate.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Accelerate
            </p>
            <ul className="space-y-4">
              {rec.skillsToAccelerate.map((s, i) => {
                const urgency = URGENCY[s.urgency] ?? URGENCY["1yr"];
                return (
                  <li key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">{s.skill}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${urgency.className}`}>
                        {urgency.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.reason}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Watch */}
          {rec.skillsToWatch.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-3">
                Watch
              </p>
              <ul className="space-y-3">
                {rec.skillsToWatch.map((s, i) => (
                  <li key={i}>
                    <span className="text-sm font-medium text-gray-800">{s.skill}</span>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deprioritize */}
          {rec.skillsToDeprioritize.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Deprioritize
              </p>
              <ul className="space-y-3">
                {rec.skillsToDeprioritize.map((s, i) => (
                  <li key={i}>
                    <span className="text-sm font-medium text-gray-500 line-through decoration-gray-300">
                      {s.skill}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{s.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ label, description }: { label: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
      <p className="text-sm text-gray-400 mt-0.5">{description}</p>
    </div>
  );
}
