"use client";

import { useEffect, useState } from "react";

type MetricTone = "good" | "bad" | "accent";
type Metric = {
  label: string;
  value: string;
  tone?: MetricTone;
};

const METRICS: Metric[] = [
  { label: "Trend", value: "+2.1σ", tone: "good" },
  { label: "Cluster", value: "A·S·E·O" },
  { label: "Threat", value: "60", tone: "bad" },
  { label: "Δ 7D", value: "+3", tone: "bad" },
  { label: "Income", value: "$90k" },
  { label: "Goal", value: "$200k", tone: "accent" },
  { label: "Signals/30d", value: "live" },
] as const;

export function TickerStrip() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const date = new Date();
      const pad = (value: number) => String(value).padStart(2, "0");
      setTime(`${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} PT`);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="sticky top-0 z-30 flex h-[46px] items-stretch border-b border-zinc-900 bg-[#080706]">
      <div className="flex items-center gap-2 border-r border-zinc-900 px-4">
        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-300" />
        <span className="mono text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
          Live
        </span>
      </div>
      <div className="flex min-w-0 flex-1 overflow-x-auto">
        {METRICS.map((metric) => (
          <div
            key={metric.label}
            className="flex min-w-[132px] flex-col justify-center border-r border-zinc-900 px-5"
          >
            <span className="eyebrow mb-0.5 text-[9px] text-zinc-600">{metric.label}</span>
            <span
              className={`num text-[14px] font-semibold leading-none ${
                metric.tone === "good"
                  ? "text-emerald-300"
                  : metric.tone === "bad"
                  ? "text-red-400"
                  : metric.tone === "accent"
                  ? "text-accent"
                  : "text-zinc-100"
              }`}
            >
              {metric.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mono flex items-center px-5 text-[11px] tracking-[0.16em] text-zinc-500">
        {time}
      </div>
    </div>
  );
}
