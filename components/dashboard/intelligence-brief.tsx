"use client";

import { useState, useTransition } from "react";
import type { RecommendationRow } from "@/lib/data/dashboard";
import type { BriefDiff } from "@/lib/data/brief-diff";
import { BriefDiffBanner } from "./brief-diff-banner";
import { BriefChat } from "./brief-chat";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function IntelligenceBrief({
  recommendation,
  briefDiff,
}: {
  recommendation: RecommendationRow | null;
  briefDiff?: BriefDiff | null;
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
    <div className="flex min-h-0 flex-col gap-4">
      {/* Column header — terminal eyebrow */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-sm"
            style={{ backgroundColor: "rgb(var(--accent))" }}
          />
          <span className="eyebrow">Intelligence brief</span>
          {recommendation && (
            <span className="font-mono text-[10px] tracking-wider text-zinc-500">
              · synth {timeAgo(recommendation.generatedAt)}
            </span>
          )}
        </div>
        {recommendation && (
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 hover:text-white transition-colors duration-150 disabled:opacity-40"
          >
            {isPending ? "Regen…" : refreshed ? "Queued" : "Regen ⟳"}
          </button>
        )}
      </div>

      {recommendation ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          {/* What changed banner */}
          {briefDiff && <BriefDiffBanner diff={briefDiff} />}

          {/* Narrative — hero analyst note, accent rule */}
          <div
            className="border-l-2 pl-5 py-1"
            style={{ borderColor: "rgb(var(--accent))" }}
          >
            <p className="eyebrow mb-2">Positioning · key narrative</p>
            <p
              className="text-[16px] leading-[1.55] text-zinc-100"
              style={{ textWrap: "pretty" }}
            >
              {recommendation.keyNarrativeToTell}
            </p>
          </div>

          {/* Income trajectory */}
          <div className="rounded-[10px] border border-zinc-800 p-5">
            <p className="eyebrow mb-2.5">Income trajectory</p>
            <p className="text-[14px] text-zinc-300 leading-relaxed">
              {recommendation.incomeTrajectoryAssessment}
            </p>
          </div>

          {/* Opportunities */}
          {recommendation.biggestOpportunities.length > 0 && (
            <div className="border-l-2 border-emerald-500/40 pl-5 py-1">
              <p className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-emerald-400 mb-2.5">
                Opportunities · ranked
              </p>
              <ol className="space-y-2.5">
                {recommendation.biggestOpportunities.map((o, i) => (
                  <li key={i} className="flex gap-3 text-[13.5px] leading-snug text-zinc-200">
                    <span className="shrink-0 font-mono text-[11px] num text-emerald-400 pt-0.5 tracking-wider">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ textWrap: "pretty" }}>{o}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Risks */}
          {recommendation.biggestRisks.length > 0 && (
            <div className="border-l-2 border-red-500/40 pl-5 py-1">
              <p className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-red-400 mb-2.5">
                Risks · watch
              </p>
              <ol className="space-y-2.5">
                {recommendation.biggestRisks.map((r, i) => (
                  <li key={i} className="flex gap-3 text-[13.5px] leading-snug text-zinc-200">
                    <span className="shrink-0 font-mono text-[11px] num text-red-400 pt-0.5 tracking-wider">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ textWrap: "pretty" }}>{r}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
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

      {/* Ask the Brief chat — only shown when a recommendation exists */}
      {recommendation && (
        <div className="shrink-0">
          <BriefChat />
        </div>
      )}
    </div>
  );
}
