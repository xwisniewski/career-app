"use client";

import { useState, useTransition } from "react";
import type { RecommendationRow } from "@/lib/data/dashboard";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function IntelligenceBrief({
  recommendation,
}: {
  recommendation: RecommendationRow | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [refreshed, setRefreshed] = useState(false);

  function handleRefresh() {
    startTransition(async () => {
      await fetch("/api/recommendations/refresh", { method: "POST" });
      setRefreshed(true);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Column header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-white tracking-[-0.01em]">Intelligence Brief</h2>
          <p className="text-[13px] text-zinc-400 mt-0.5">Your market, synthesized</p>
        </div>
        {recommendation && (
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="text-[12px] text-zinc-500 hover:text-zinc-200 transition-all duration-150 disabled:opacity-40"
          >
            {isPending ? "Refreshing…" : refreshed ? "Queued" : "Refresh"}
          </button>
        )}
      </div>

      {recommendation ? (
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-240px)] pr-1">
          {/* Narrative */}
          <div className="rounded-[10px] border border-zinc-800 p-5">
            <p className="label mb-2.5">Current Positioning</p>
            <p className="text-[14px] text-zinc-300 leading-relaxed">{recommendation.keyNarrativeToTell}</p>
          </div>

          {/* Income trajectory */}
          <div className="rounded-[10px] border border-zinc-800 p-5">
            <p className="label mb-2.5">Income Trajectory</p>
            <p className="text-[14px] text-zinc-300 leading-relaxed">
              {recommendation.incomeTrajectoryAssessment}
            </p>
          </div>

          {/* Opportunities */}
          {recommendation.biggestOpportunities.length > 0 && (
            <div className="rounded-[10px] border border-emerald-500/20 bg-emerald-500/10 p-5">
              <p className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider mb-2.5">
                Biggest Opportunities
              </p>
              <ul className="space-y-2">
                {recommendation.biggestOpportunities.map((o, i) => (
                  <li key={i} className="text-[13px] text-emerald-300 flex gap-2 leading-snug">
                    <span className="shrink-0 mt-0.5 text-emerald-400">→</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {recommendation.biggestRisks.length > 0 && (
            <div className="rounded-[10px] border border-red-500/20 bg-red-500/10 p-5">
              <p className="text-[11px] font-medium text-red-400 uppercase tracking-wider mb-2.5">
                Biggest Risks
              </p>
              <ul className="space-y-2">
                {recommendation.biggestRisks.map((r, i) => (
                  <li key={i} className="text-[13px] text-red-300 flex gap-2 leading-snug">
                    <span className="shrink-0 mt-0.5 text-red-400">—</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[11px] text-zinc-400 text-right">
            Generated {timeAgo(recommendation.generatedAt)}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-[10px] border border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
            <span className="w-2 h-2 rounded-full bg-zinc-600 block" />
          </div>
          <p className="text-[14px] font-medium text-zinc-300">No brief generated yet</p>
          <p className="text-[13px] text-zinc-400 mt-1 mb-5 max-w-xs leading-relaxed">
            Your first brief will be generated once signals are ingested and matched to your profile.
          </p>
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="btn-primary text-[13px]"
          >
            {isPending ? "Queuing…" : refreshed ? "Queued" : "Generate first brief"}
          </button>
        </div>
      )}
    </div>
  );
}
