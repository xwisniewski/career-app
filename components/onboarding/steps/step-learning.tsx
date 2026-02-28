"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveStep5 } from "@/lib/actions/onboarding";

type Props = {
  initial: {
    hoursPerWeekForLearning: number;
    preferredLearningStyle: string;
  };
  onBack: () => void;
};

const STYLES = [
  { value: "COURSES", label: "Courses", description: "Structured video or written courses" },
  { value: "PROJECTS", label: "Projects", description: "Learning by building things" },
  { value: "MENTORSHIP", label: "Mentorship", description: "Working with experienced people" },
  { value: "READING", label: "Reading", description: "Books, papers, articles" },
  { value: "MIXED", label: "Mixed", description: "A blend of all the above" },
];

export function StepLearning({ initial, onBack }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [hours, setHours] = useState(initial.hoursPerWeekForLearning ?? 5);
  const [style, setStyle] = useState(initial.preferredLearningStyle ?? "MIXED");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await saveStep5({
        hoursPerWeekForLearning: Number(hours),
        preferredLearningStyle: style,
      });
      if (result.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Learning capacity</h2>
        <p className="mt-1 text-sm text-gray-500">How much time and energy you can put toward skill-building.</p>
      </div>

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
          onChange={(e) => setHours(Number(e.target.value))}
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
                onChange={() => setStyle(s.value)}
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="btn-ghost">← Back</button>
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Finishing up…" : "Complete setup →"}
        </button>
      </div>
    </form>
  );
}
