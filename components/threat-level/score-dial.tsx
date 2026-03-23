"use client";

type Props = {
  score: number; // 0–100
  size?: "sm" | "lg";
};

/** Circular SVG gauge — green (low) → amber (moderate) → red (high). */
export function ScoreDial({ score, size = "lg" }: Props) {
  const dim = size === "lg" ? 160 : 80;
  const strokeWidth = size === "lg" ? 10 : 6;
  const radius = (dim - strokeWidth) / 2;
  const cx = dim / 2;
  const cy = dim / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc covers 270° (starting at 135°, ending at 405°/45°)
  const arcLength = circumference * 0.75;
  const filled = (score / 100) * arcLength;
  const dashoffset = arcLength - filled;

  const color =
    score >= 67
      ? "#ef4444" // red-500
      : score >= 34
      ? "#f59e0b" // amber-500
      : "#22c55e"; // green-500

  const label = score >= 67 ? "HIGH" : score >= 34 ? "MODERATE" : "LOW";

  const fontSize = size === "lg" ? "text-3xl" : "text-sm";
  const labelSize = size === "lg" ? "text-[10px]" : "text-[8px]";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: dim, height: dim }}>
      <svg width={dim} height={dim} className="-rotate-[135deg]">
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.4s ease" }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`${fontSize} font-bold text-white leading-none`} style={{ color }}>
          {score}
        </span>
        {size === "lg" && (
          <span className={`${labelSize} font-semibold tracking-widest mt-1`} style={{ color }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
