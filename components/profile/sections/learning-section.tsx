"use client";

import { useState, useTransition } from "react";
import { updateLearning } from "@/lib/actions/profile";
import { SectionHeader, SaveRow } from "./situation-section";

const STYLES = [
  { value: "COURSES", label: "Courses", description: "Structured video or written courses" },
  { value: "PROJECTS", label: "Projects", description: "Learning by building things" },
  { value: "MENTORSHIP", label: "Mentorship", description: "Working with experienced people" },
  { value: "READING", label: "Reading", description: "Books, papers, articles" },
  { value: "MIXED", label: "Mixed", description: "A blend of all the above" },
];

type Props = {
  initial: {
    hoursPerWeekForLearning: number;
    preferredLearningStyle: string;
  };
};

export function LearningSection({ initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [hours, setHours] = useState(initial.hoursPerWeekForLearning);
  const [style, setStyle] = useState(initial.preferredLearningStyle);

  function markDirty() { setSaved(false); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    startTransition(async () => {
      const result = await updateLearning({
        hoursPerWeekForLearning: Number(hours),
        preferredLearningStyle: style,
      });
      if (result.ok) setSaved(true);
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionHeader title="Learning capacity" description="How much time and energy you can put toward skill-building." />

      <div>
        <div className="flex justify-between items-baseline mb-1">
          <label className="text-sm font-medium text-gray-700">Hours per week for learning</label>
          <span className="text-sm text-gray-500">{hours} hr{hours !== 1 ? "s" : ""}</span>
        </div>
        <input
          type="range"
          min={1}
          max={40}
          value={hours}
          onChange={(e) => { setHours(Number(e.target.value)); markDirty(); }}
          className="w-full accent-gray-900"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>1 hr</span>
          <span>40 hrs</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred learning style</label>
        <div className="space-y-2">
          {STYLES.map((s) => (
            <label
              key={s.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                style === s.value
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="learningStyle"
                value={s.value}
                checked={style === s.value}
                onChange={() => { setStyle(s.value); markDirty(); }}
                className="mt-0.5 accent-gray-900"
              />
              <div>
                <div className="text-sm font-medium text-gray-800">{s.label}</div>
                <div className="text-xs text-gray-500">{s.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <SaveRow isPending={isPending} saved={saved} error={error} />
    </form>
  );
}
