"use client";

import { useState, useTransition } from "react";
import { saveStep1 } from "@/lib/actions/onboarding";

const EDUCATION_LEVELS = [
  "High School",
  "Bachelor's",
  "Master's",
  "PhD",
  "Bootcamp",
  "Self-taught",
];

type Props = {
  initial: {
    currentRole: string;
    currentIndustry: string;
    yearsOfExperience: number;
    educationLevel: string;
    educationField: string;
    currentLocation: string;
  };
  onNext: () => void;
};

export function StepSituation({ initial, onNext }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    currentRole: initial.currentRole ?? "",
    currentIndustry: initial.currentIndustry ?? "",
    yearsOfExperience: initial.yearsOfExperience ?? 0,
    educationLevel: initial.educationLevel ?? "",
    educationField: initial.educationField ?? "",
    currentLocation: initial.currentLocation ?? "",
  });

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await saveStep1({
        ...form,
        yearsOfExperience: Number(form.yearsOfExperience),
      });
      if (result.ok) {
        onNext();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Your current situation</h2>
        <p className="mt-1 text-sm text-gray-500">Tell us where you are today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Current role</label>
          <input
            type="text"
            required
            value={form.currentRole}
            onChange={(e) => set("currentRole", e.target.value)}
            placeholder="e.g. Senior Product Manager"
            className="input"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
          <input
            type="text"
            required
            value={form.currentIndustry}
            onChange={(e) => set("currentIndustry", e.target.value)}
            placeholder="e.g. Fintech"
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Years of experience</label>
          <input
            type="number"
            required
            min={0}
            max={60}
            value={form.yearsOfExperience}
            onChange={(e) => set("yearsOfExperience", e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            required
            value={form.currentLocation}
            onChange={(e) => set("currentLocation", e.target.value)}
            placeholder="e.g. New York, NY"
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Education level</label>
          <select
            required
            value={form.educationLevel}
            onChange={(e) => set("educationLevel", e.target.value)}
            className="input"
          >
            <option value="">Select…</option>
            {EDUCATION_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Field of study</label>
          <input
            type="text"
            value={form.educationField}
            onChange={(e) => set("educationField", e.target.value)}
            placeholder="e.g. Computer Science"
            className="input"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Saving…" : "Continue →"}
        </button>
      </div>
    </form>
  );
}
