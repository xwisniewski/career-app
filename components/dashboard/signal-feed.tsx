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
    <div className="flex flex-col gap-4">
      {/* Column header */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Signal Feed</h2>
        <p className="text-xs text-gray-400 mt-0.5">Macro signals matched to your profile</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1">
          {CATEGORY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                category === value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["ALL", "POSITIVE", "NEGATIVE", "NEUTRAL"] as Sentiment[]).map((s) => (
            <button
              key={s}
              onClick={() => setSentiment(s)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                sentiment === s
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "ALL" ? "All" : s === "POSITIVE" ? "🟢 Opportunity" : s === "NEGATIVE" ? "🔴 Risk" : "🟡 Watch"}
            </button>
          ))}
        </div>
      </div>

      {/* Signal list */}
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-lg">📡</span>
            </div>
            <p className="text-sm font-medium text-gray-700">No signals yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Signals populate once the scraping jobs run. Check back after the first cron run or trigger one manually from /admin.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400">{filtered.length} signal{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
