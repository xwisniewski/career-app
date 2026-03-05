"use client";

import { useState, useMemo } from "react";
import type { SignalRow } from "@/lib/data/dashboard";
import { SignalCard } from "./signal-card";

type Category = "ALL" | "JOB_MARKET" | "CAPITAL_FLOWS" | "SKILL_DEMAND" | "DISPLACEMENT_RISK" | "POLICY";
type Sentiment = "ALL" | "POSITIVE" | "NEGATIVE" | "NEUTRAL";

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "JOB_MARKET", label: "Jobs" },
  { value: "CAPITAL_FLOWS", label: "Capital" },
  { value: "SKILL_DEMAND", label: "Skills" },
  { value: "DISPLACEMENT_RISK", label: "Risk" },
  { value: "POLICY", label: "Policy" },
];

const SENTIMENT_OPTIONS: { value: Sentiment; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "POSITIVE", label: "Opportunity" },
  { value: "NEGATIVE", label: "Risk" },
  { value: "NEUTRAL", label: "Watch" },
];

export function SignalFeed({ signals }: { signals: SignalRow[] }) {
  const [category, setCategory] = useState<Category>("ALL");
  const [sentiment, setSentiment] = useState<Sentiment>("ALL");

  const filtered = useMemo(() => {
    return signals.filter((s) => {
      if (category !== "ALL" && s.category !== category) return false;
      if (sentiment !== "ALL" && s.sentiment !== sentiment) return false;
      return true;
    });
  }, [signals, category, sentiment]);

  return (
    <div className="flex flex-col gap-5">
      {/* Column header */}
      <div>
        <h2 className="text-[15px] font-semibold text-white tracking-[-0.01em]">Signal Feed</h2>
        <p className="text-[13px] text-zinc-400 mt-0.5">Macro signals matched to your profile</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1">
          {CATEGORY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={`px-2.5 py-1 rounded-full text-[12px] font-medium transition-all duration-150 ${
                category === value
                  ? "bg-zinc-700 text-white"
                  : "bg-zinc-800/60 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {SENTIMENT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSentiment(value)}
              className={`px-2.5 py-1 rounded-full text-[12px] font-medium transition-all duration-150 ${
                sentiment === value
                  ? "bg-zinc-700 text-white"
                  : "bg-zinc-800/60 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Signal list */}
      <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-240px)] pr-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
              <span className="w-2 h-2 rounded-full bg-zinc-600 block" />
            </div>
            <p className="text-[14px] font-medium text-zinc-300">No signals yet</p>
            <p className="text-[13px] text-zinc-400 mt-1 max-w-xs leading-relaxed">
              Signals populate once the scraping jobs run. Trigger one manually from /admin.
            </p>
          </div>
        ) : (
          <>
            <p className="text-[12px] text-zinc-400">{filtered.length} signal{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
