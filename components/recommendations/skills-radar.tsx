"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type SkillPoint = { skill: string; current: number; recommended: number };

export function SkillsRadar({ data }: { data: SkillPoint[] }) {
  if (data.length < 3) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-zinc-500">
        Add at least 3 skills to your profile to see the radar chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
        <PolarGrid stroke="#3f3f46" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
        />
        <Radar
          name="Current"
          dataKey="current"
          stroke="#71717a"
          fill="#71717a"
          fillOpacity={0.35}
          dot={{ r: 2, fill: "#71717a" }}
        />
        <Radar
          name="Recommended"
          dataKey="recommended"
          stroke="#34d399"
          fill="#34d399"
          fillOpacity={0.15}
          dot={{ r: 2, fill: "#34d399" }}
        />
        <Legend
          wrapperStyle={{ fontSize: "11px", color: "#a1a1aa" }}
        />
        <Tooltip
          formatter={(value: number | undefined, name: string | undefined) => [`${value ?? 0}/5`, name ?? ""]}
          contentStyle={{
            fontSize: "12px",
            borderRadius: "8px",
            border: "1px solid #3f3f46",
            backgroundColor: "#18181b",
            color: "#e4e4e7",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
