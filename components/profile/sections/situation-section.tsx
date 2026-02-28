"use client";

import { useState, useTransition } from "react";
import { updateSituation } from "@/lib/actions/profile";

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
};

export function SituationSection({ initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ ...initial });

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    startTransition(async () => {
      const result = await updateSituation({
        ...form,
        yearsOfExperience: Number(form.yearsOfExperience),
      });
      if (result.ok) setSaved(true);
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <SectionHeader
        title="Current situation"
        description="Your role, industry, and background today."
      />

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

      <SaveRow isPending={isPending} saved={saved} error={error} />
    </form>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

export function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="pb-2 border-b border-gray-100">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-400 mt-0.5">{description}</p>
    </div>
  );
}

export function SaveRow({
  isPending,
  saved,
  error,
}: {
  isPending: boolean;
  saved: boolean;
  error: string;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && (
          <p className="text-sm text-green-600">
            Saved — new report generating in the background.
          </p>
        )}
      </div>
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
