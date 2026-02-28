"use client";

import { useState, useTransition } from "react";
import { saveStep2 } from "@/lib/actions/onboarding";

type PrimarySkill = { name: string; proficiencyLevel: number; yearsUsed: number | null };

type Props = {
  initial: {
    primarySkills: PrimarySkill[];
    learningSkills: string[];
    desiredSkills: string[];
  };
  onNext: () => void;
  onBack: () => void;
};

function TagInput({
  label,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-gray-400 hover:text-gray-700 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export function StepSkills({ initial, onNext, onBack }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [primarySkills, setPrimarySkills] = useState<PrimarySkill[]>(initial.primarySkills ?? []);
  const [learningSkills, setLearningSkills] = useState<string[]>(initial.learningSkills ?? []);
  const [desiredSkills, setDesiredSkills] = useState<string[]>(initial.desiredSkills ?? []);
  const [newSkill, setNewSkill] = useState({ name: "", proficiencyLevel: 3, yearsUsed: "" });

  function addPrimarySkill() {
    if (!newSkill.name.trim()) return;
    setPrimarySkills((prev) => [
      ...prev,
      {
        name: newSkill.name.trim(),
        proficiencyLevel: newSkill.proficiencyLevel,
        yearsUsed: newSkill.yearsUsed ? Number(newSkill.yearsUsed) : null,
      },
    ]);
    setNewSkill({ name: "", proficiencyLevel: 3, yearsUsed: "" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await saveStep2({ primarySkills, learningSkills, desiredSkills });
      if (result.ok) onNext();
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Your skills</h2>
        <p className="mt-1 text-sm text-gray-500">What you know, what you&apos;re learning, what you want to learn.</p>
      </div>

      {/* Primary skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Primary skills</label>
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
          {primarySkills.map((skill, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-medium text-gray-800">{skill.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  Level {skill.proficiencyLevel}/5
                  {skill.yearsUsed != null ? ` · ${skill.yearsUsed}yr` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => setPrimarySkills((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-gray-400 hover:text-red-500 text-sm"
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          {/* Add row */}
          <div className="flex gap-2 p-3 bg-gray-50 rounded-b-lg">
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => setNewSkill((s) => ({ ...s, name: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPrimarySkill(); } }}
              placeholder="Skill name"
              className="input flex-1 text-sm"
            />
            <select
              value={newSkill.proficiencyLevel}
              onChange={(e) => setNewSkill((s) => ({ ...s, proficiencyLevel: Number(e.target.value) }))}
              className="input w-28 text-sm"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>Level {n}</option>
              ))}
            </select>
            <input
              type="number"
              value={newSkill.yearsUsed}
              onChange={(e) => setNewSkill((s) => ({ ...s, yearsUsed: e.target.value }))}
              placeholder="Yrs"
              min={0}
              className="input w-16 text-sm"
            />
            <button type="button" onClick={addPrimarySkill} className="btn-secondary text-sm">
              Add
            </button>
          </div>
        </div>
      </div>

      <TagInput
        label="Currently learning"
        tags={learningSkills}
        onChange={setLearningSkills}
        placeholder="e.g. Rust, machine learning…"
      />

      <TagInput
        label="Want to learn"
        tags={desiredSkills}
        onChange={setDesiredSkills}
        placeholder="e.g. Systems design, leadership…"
      />

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
