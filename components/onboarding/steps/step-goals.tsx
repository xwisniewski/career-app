"use client";

import { useState, useTransition } from "react";
import { saveStep3 } from "@/lib/actions/onboarding";

type Props = {
  initial: {
    targetRoles: string[];
    targetIndustries: string[];
    targetTimeHorizon: string;
    incomeGoal: number;
    currentCompensation: number;
  };
  onNext: () => void;
  onBack: () => void;
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

export function StepGoals({ initial, onNext, onBack }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [targetRoles, setTargetRoles] = useState<string[]>(initial.targetRoles ?? []);
  const [targetIndustries, setTargetIndustries] = useState<string[]>(initial.targetIndustries ?? []);
  const [timeHorizon, setTimeHorizon] = useState(initial.targetTimeHorizon ?? "3yr");
  const [incomeGoal, setIncomeGoal] = useState<string | number>(initial.incomeGoal ?? "");
  const [currentComp, setCurrentComp] = useState<string | number>(initial.currentCompensation ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (targetRoles.length === 0) { setError("Add at least one target role."); return; }
    setError("");
    startTransition(async () => {
      const result = await saveStep3({
        targetRoles,
        targetIndustries,
        targetTimeHorizon: timeHorizon,
        incomeGoal: Number(incomeGoal),
        currentCompensation: Number(currentComp),
      });
      if (result.ok) onNext();
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Your career goals</h2>
        <p className="mt-1 text-sm text-gray-500">Where you want to go and by when.</p>
      </div>

      <TagInput
        label="Target roles"
        hint="(required)"
        tags={targetRoles}
        onChange={setTargetRoles}
        placeholder="e.g. VP of Product, Founder…"
      />

      <TagInput
        label="Target industries"
        tags={targetIndustries}
        onChange={setTargetIndustries}
        placeholder="e.g. AI, Climate Tech…"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Time horizon</label>
        <div className="grid grid-cols-4 gap-2">
          {(["1yr", "3yr", "5yr", "10yr"] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setTimeHorizon(h)}
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
            onChange={(e) => setIncomeGoal(e.target.value)}
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
            onChange={(e) => setCurrentComp(e.target.value)}
            placeholder="e.g. 140000"
            className="input"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="btn-ghost">← Back</button>
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Saving…" : "Continue →"}
        </button>
      </div>
    </form>
  );
}
