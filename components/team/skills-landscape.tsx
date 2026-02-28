type Skill = { name: string; avgLevel: number; memberCount: number };

export function SkillsLandscape({
  skills,
  memberCount,
}: {
  skills: Skill[];
  memberCount: number;
}) {
  if (skills.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-400">
        No skills data yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      {skills.map((skill) => {
        const coverage = Math.round((skill.memberCount / memberCount) * 100);
        const levelPct = Math.round((skill.avgLevel / 5) * 100);
        return (
          <div key={skill.name} className="flex items-center gap-4">
            {/* Skill name */}
            <span className="text-sm text-gray-800 w-40 shrink-0 truncate" title={skill.name}>
              {skill.name}
            </span>

            {/* Proficiency bar */}
            <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-0">
              <div
                className="bg-gray-900 h-2 rounded-full"
                style={{ width: `${levelPct}%` }}
              />
            </div>

            {/* Avg level */}
            <span className="text-xs text-gray-500 w-12 shrink-0 text-right">
              {skill.avgLevel}/5
            </span>

            {/* Coverage */}
            <span className="text-xs text-gray-400 w-16 shrink-0 text-right">
              {coverage}% of team
            </span>
          </div>
        );
      })}
    </div>
  );
}
