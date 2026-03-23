type SubScore = {
  label: string;
  score: number;
  max: number;
  description: string;
};

type Props = {
  roleRisk: number;
  industryRisk: number;
  skillsGap: number;
  companyTypeRisk: number;
  matchedOccupation: string | null;
  exposureScore: number | null;
};

export function BreakdownGrid({
  roleRisk,
  industryRisk,
  skillsGap,
  companyTypeRisk,
  matchedOccupation,
  exposureScore,
}: Props) {
  const subScores: SubScore[] = [
    {
      label: "Role Exposure",
      score: roleRisk,
      max: 40,
      description: matchedOccupation
        ? `${matchedOccupation} — ${exposureScore !== null ? Math.round(exposureScore * 100) : "?"}% observed AI coverage (Anthropic/EconomicIndex). Note: early damage shows in hiring slowdowns, not unemployment.`
        : "No O*NET occupation match found. Update your role in Profile for a precise reading.",
    },
    {
      label: "Industry Risk",
      score: industryRisk,
      max: 25,
      description: "Based on macro signals in your industry over the last 90 days — displacement events, layoff waves, and capital flow shifts.",
    },
    {
      label: "Skills Gap",
      score: skillsGap,
      max: 25,
      description: "Measures how many in-demand skills from recent SKILL_DEMAND signals are absent from your stack.",
    },
    {
      label: "Company-Type Risk",
      score: companyTypeRisk,
      max: 10,
      description: "Driven by active layoff and displacement signals in your company type / industry sector over the last 30 days.",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {subScores.map((s) => {
        const pct = s.score / s.max;
        const color = pct >= 0.67 ? "text-red-400" : pct >= 0.4 ? "text-amber-400" : "text-green-400";
        const barColor = pct >= 0.67 ? "bg-red-500" : pct >= 0.4 ? "bg-amber-500" : "bg-green-500";

        return (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
                {s.label}
              </span>
              <span className={`text-[13px] font-bold ${color}`}>
                {s.score}
                <span className="text-zinc-600 font-normal">/{s.max}</span>
              </span>
            </div>
            {/* Bar */}
            <div className="h-1.5 bg-zinc-800 rounded-full mb-3">
              <div
                className={`h-full rounded-full ${barColor} transition-all duration-700`}
                style={{ width: `${pct * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">{s.description}</p>
          </div>
        );
      })}
    </div>
  );
}
