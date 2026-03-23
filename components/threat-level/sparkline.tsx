import type { SparklinePoint } from "@/lib/data/threat-level";

type Props = {
  data: SparklinePoint[];
  height?: number;
};

/** SVG sparkline for 30-day threat score trend. No external library needed. */
export function ThreatSparkline({ data, height = 48 }: Props) {
  if (data.length < 2) {
    return (
      <div
        className="flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg"
        style={{ height }}
      >
        <span className="text-[11px] text-zinc-600">Not enough data for trend</span>
      </div>
    );
  }

  const width = 600; // SVG viewBox width (scales to container)
  const padding = { top: 6, bottom: 6, left: 4, right: 4 };

  const scores = data.map((d) => d.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore || 1;

  const toX = (i: number) =>
    padding.left + (i / (data.length - 1)) * (width - padding.left - padding.right);
  const toY = (score: number) =>
    padding.top + ((maxScore - score) / range) * (height - padding.top - padding.bottom);

  const points = data.map((d, i) => `${toX(i)},${toY(d.score)}`);
  const polyline = points.join(" ");

  // Last point color
  const lastScore = scores[scores.length - 1];
  const lineColor =
    lastScore >= 67 ? "#ef4444" : lastScore >= 34 ? "#f59e0b" : "#22c55e";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-zinc-500">30-day trend</span>
        <span className="text-[11px] text-zinc-500">
          {data[0]?.date} → {data[data.length - 1]?.date}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <polyline
          points={polyline}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Dot on latest point */}
        <circle
          cx={toX(data.length - 1)}
          cy={toY(lastScore)}
          r="3"
          fill={lineColor}
        />
      </svg>
    </div>
  );
}
