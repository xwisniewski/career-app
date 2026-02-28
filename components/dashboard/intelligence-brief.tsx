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
    <div className="flex flex-col gap-4">
      {/* Column header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Intelligence Brief</h2>
          <p className="text-xs text-gray-400 mt-0.5">Your market, synthesized</p>
        </div>
        {recommendation && (
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Refreshing…" : refreshed ? "Queued ✓" : "↻ Refresh"}
          </button>
        )}
      </div>

      {recommendation ? (
        <div className="flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
          {/* Narrative */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Current Positioning
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{recommendation.keyNarrativeToTell}</p>
          </div>

          {/* Income trajectory */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Income Trajectory
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {recommendation.incomeTrajectoryAssessment}
            </p>
          </div>

          {/* Risks + Opportunities */}
          <div className="grid grid-cols-1 gap-3">
            {recommendation.biggestOpportunities.length > 0 && (
              <div className="bg-green-50 rounded-lg border border-green-100 p-4">
                <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-2">
                  Biggest Opportunities
                </p>
                <ul className="space-y-1.5">
                  {recommendation.biggestOpportunities.map((o, i) => (
                    <li key={i} className="text-sm text-green-800 flex gap-2">
                      <span className="shrink-0 mt-0.5">→</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {recommendation.biggestRisks.length > 0 && (
              <div className="bg-red-50 rounded-lg border border-red-100 p-4">
                <p className="text-xs font-medium text-red-700 uppercase tracking-wide mb-2">
                  Biggest Risks
                </p>
                <ul className="space-y-1.5">
                  {recommendation.biggestRisks.map((r, i) => (
                    <li key={i} className="text-sm text-red-800 flex gap-2">
                      <span className="shrink-0 mt-0.5">⚠</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 text-right">
            Generated {timeAgo(recommendation.generatedAt)}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-gray-200">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <span className="text-lg">🧠</span>
          </div>
          <p className="text-sm font-medium text-gray-700">No brief generated yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-4 max-w-xs">
            Your first intelligence brief will be generated once signals are ingested and matched to your profile.
          </p>
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="btn-primary text-xs"
          >
            {isPending ? "Queuing…" : refreshed ? "Queued ✓" : "Generate first brief"}
          </button>
        </div>
      )}
    </div>
  );
}
