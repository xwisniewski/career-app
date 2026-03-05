"use client";

import dynamic from "next/dynamic";
import type { FullRecommendation, RecommendationProfile } from "@/lib/data/recommendations";

const SkillsRadar = dynamic(
  () => import("./skills-radar").then((m) => m.SkillsRadar),
  { ssr: false, loading: () => <div className="h-64 bg-zinc-900 rounded-[10px] animate-pulse" /> }
);

const URGENCY = {
  now: { label: "Now", className: "bg-red-500/10 text-red-400 border border-red-500/20" },
  "6mo": { label: "6 mo", className: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  "1yr": { label: "1 yr", className: "bg-zinc-800 text-zinc-400 border border-zinc-700" },
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

  // Add recommended skills the user doesn't have yet (current = 0)
  const existingSkillNames = new Set(radarData.map((d) => d.skill.toLowerCase()));
  for (const s of rec.skillsToAccelerate) {
    if (!existingSkillNames.has(s.skill.toLowerCase())) {
      const targetLevel = s.urgency === "now" ? 3 : s.urgency === "6mo" ? 2 : 1;
      radarData.push({ skill: s.skill, current: 0, recommended: targetLevel });
    }
  }

  return (
    <section id="skills" className="flex flex-col gap-6">
      <div className="section-header">
        <h2 className="text-[20px] font-semibold text-white tracking-[-0.02em]">Skills Radar</h2>
        <p className="text-[14px] text-zinc-500">What to build, what to dial back, what to watch.</p>
      </div>

      {radarData.length > 0 && (
        <div className="rounded-[10px] border border-zinc-800 p-6">
          <p className="label mb-4">Current vs. recommended skill levels</p>
          <SkillsRadar data={radarData} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rec.skillsToAccelerate.length > 0 && (
          <div className="rounded-[10px] border border-zinc-800 p-5">
            <p className="label mb-4">Accelerate</p>
            <ul className="space-y-4">
              {rec.skillsToAccelerate.map((s, i) => {
                const urgency = URGENCY[s.urgency] ?? URGENCY["1yr"];
                return (
                  <li key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[14px] font-semibold text-zinc-100">{s.skill}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${urgency.className}`}>
                        {urgency.label}
                      </span>
                    </div>
                    <p className="text-[13px] text-zinc-500 leading-relaxed">{s.reason}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {rec.skillsToWatch.length > 0 && (
            <div className="rounded-[10px] border border-zinc-800 p-5">
              <p className="label mb-3" style={{ color: "#fbbf24" }}>Watch</p>
              <ul className="space-y-3">
                {rec.skillsToWatch.map((s, i) => (
                  <li key={i}>
                    <span className="text-[14px] font-medium text-zinc-200">{s.skill}</span>
                    <p className="text-[13px] text-zinc-500 mt-0.5 leading-relaxed">{s.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rec.skillsToDeprioritize.length > 0 && (
            <div className="rounded-[10px] border border-zinc-800 p-5">
              <p className="label mb-3">Deprioritize</p>
              <ul className="space-y-3">
                {rec.skillsToDeprioritize.map((s, i) => (
                  <li key={i}>
                    <span className="text-[14px] font-medium text-zinc-600 line-through decoration-zinc-700">
                      {s.skill}
                    </span>
                    <p className="text-[13px] text-zinc-400 mt-0.5 leading-relaxed">{s.reason}</p>
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
