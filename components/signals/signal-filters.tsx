"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "JOB_MARKET", label: "Job Market" },
  { value: "CAPITAL_FLOWS", label: "Capital" },
  { value: "SKILL_DEMAND", label: "Skills" },
  { value: "DISPLACEMENT_RISK", label: "Displacement" },
  { value: "POLICY", label: "Policy" },
];

const SENTIMENTS = [
  { value: "", label: "All" },
  { value: "POSITIVE", label: "🟢 Opportunity" },
  { value: "NEGATIVE", label: "🔴 Risk" },
  { value: "NEUTRAL", label: "🟡 Watch" },
];

export function SignalFilters({ sources }: { sources: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const sentiment = searchParams.get("sentiment") ?? "";
  const source = searchParams.get("source") ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset to page 1 on filter change
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const hasFilters = q || category || sentiment || source;

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </span>
        <input
          type="text"
          defaultValue={q}
          onChange={(e) => update("q", e.target.value)}
          placeholder="Search signals…"
          className="input pl-9"
        />
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => update("category", value)}
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
      </div>

      {/* Sentiment */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Signal type</p>
        <div className="flex flex-wrap gap-1.5">
          {SENTIMENTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => update("sentiment", value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                sentiment === value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Source */}
      {sources.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Source</p>
          <select
            value={source}
            onChange={(e) => update("source", e.target.value)}
            className="input text-sm"
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => router.replace(pathname)}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors text-left"
        >
          × Clear all filters
        </button>
      )}
    </div>
  );
}
