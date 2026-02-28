"use client";

import { useState, useTransition } from "react";
import { updateGoals } from "@/lib/actions/profile";
import { SectionHeader, SaveRow } from "./situation-section";

type Props = {
  initial: {
    targetRoles: string[];
    targetIndustries: string[];
    targetTimeHorizon: string;
    incomeGoal: number;
    currentCompensation: number;
  };
};

function TagInput({
  label,
  hint,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  function add() {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput("");
  }
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {hint && <span className="ml-1 text-gray-400 font-normal">{hint}</span>}
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="input flex-1"
        />
        <button type="button" onClick={add} className="btn-secondary">Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-2.5 py-1 rounded-full">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} className="text-gray-400 hover:text-gray-700">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

// Map Prisma enum values back to display strings
const HORIZON_DISPLAY: Record<string, string> = {
  ONE_YEAR: "1yr",
  THREE_YEAR: "3yr",
  FIVE_YEAR: "5yr",
  TEN_YEAR: "10yr",
};

export function GoalsSection({ initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [targetRoles, setTargetRoles] = useState<string[]>(initial.targetRoles);
  const [targetIndustries, setTargetIndustries] = useState<string[]>(initial.targetIndustries);
  const [timeHorizon, setTimeHorizon] = useState(
    HORIZON_DISPLAY[initial.targetTimeHorizon] ?? initial.targetTimeHorizon
  );
  const [incomeGoal, setIncomeGoal] = useState<string | number>(initial.incomeGoal || "");
  const [currentComp, setCurrentComp] = useState<string | number>(initial.currentCompensation || "");

  function markDirty() { setSaved(false); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (targetRoles.length === 0) { setError("Add at least one target role."); return; }
    setError("");
    setSaved(false);
    startTransition(async () => {
      const result = await updateGoals({
        targetRoles,
        targetIndustries,
        targetTimeHorizon: timeHorizon,
        incomeGoal: Number(incomeGoal),
        currentCompensation: Number(currentComp),
      });
      if (result.ok) setSaved(true);
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <SectionHeader title="Career goals" description="Where you want to go and by when." />

      <TagInput
        label="Target roles"
        hint="(required)"
        tags={targetRoles}
        onChange={(t) => { setTargetRoles(t); markDirty(); }}
        placeholder="e.g. VP of Product, Founder…"
      />

      <TagInput
        label="Target industries"
        tags={targetIndustries}
        onChange={(t) => { setTargetIndustries(t); markDirty(); }}
        placeholder="e.g. AI, Climate Tech…"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Time horizon</label>
        <div className="grid grid-cols-4 gap-2">
          {(["1yr", "3yr", "5yr", "10yr"] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => { setTimeHorizon(h); markDirty(); }}
              className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                timeHorizon === h
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Income goal (USD/yr)</label>
          <input
            type="number"
            required
            min={0}
            value={incomeGoal}
            onChange={(e) => { setIncomeGoal(e.target.value); markDirty(); }}
            placeholder="e.g. 250000"
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current compensation <span className="text-gray-400 font-normal">(private)</span>
          </label>
          <input
            type="number"
            required
            min={0}
            value={currentComp}
            onChange={(e) => { setCurrentComp(e.target.value); markDirty(); }}
            placeholder="e.g. 140000"
            className="input"
          />
        </div>
      </div>

      <SaveRow isPending={isPending} saved={saved} error={error} />
    </form>
  );
}
