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
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">
        Add at least 3 skills to your profile to see the radar chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fontSize: 11, fill: "#6b7280" }}
        />
        <Radar
          name="Current"
          dataKey="current"
          stroke="#d1d5db"
          fill="#d1d5db"
          fillOpacity={0.4}
        />
        <Radar
          name="Recommended"
          dataKey="recommended"
          stroke="#111827"
          fill="#111827"
          fillOpacity={0.2}
        />
        <Legend
          wrapperStyle={{ fontSize: "11px", color: "#6b7280" }}
        />
        <Tooltip
          formatter={(value: number | undefined, name: string | undefined) => [`${value ?? 0}/5`, name ?? ""]}
          contentStyle={{ fontSize: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
