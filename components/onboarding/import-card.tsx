"use client";

import { useRef, useState, useTransition } from "react";

export type ProfileImportDraft = {
  currentRole: string | null;
  currentIndustry: string | null;
  yearsOfExperience: number | null;
  educationLevel: string | null;
  educationField: string | null;
  currentLocation: string | null;
  primarySkills: { name: string; proficiencyLevel: number; yearsUsed: number | null }[];
  learningSkills: string[];
  desiredSkills: string[];
  targetRoles: string[];
  targetIndustries: string[];
  networkStrengthByIndustry: { industry: string; strength: number }[];
  confidence: {
    currentSituation: number;
    skills: number;
    goals: number;
  };
  notes: string[];
};

type Props = {
  onImported: (draft: ProfileImportDraft) => void;
};

function confidenceLabel(value: number) {
  if (value >= 0.75) return "high";
  if (value >= 0.45) return "medium";
  return "low";
}

export function ImportCard({ onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<ProfileImportDraft | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleImport() {
    const file = fileRef.current?.files?.[0] ?? null;
    if (!file && !text.trim()) {
      setError("Upload a resume/LinkedIn PDF or paste profile text.");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const formData = new FormData();
        if (file) formData.append("file", file);
        if (text.trim()) formData.append("text", text.trim());

        const response = await fetch("/api/profile/import", {
          method: "POST",
          body: formData,
        });

        let payload: { ok?: boolean; error?: string; draft?: ProfileImportDraft };
        try {
          payload = await response.json();
        } catch {
          setError("Import failed — server returned an unexpected response.");
          return;
        }

        if (!response.ok || !payload.ok) {
          setError(payload.error ?? "Import failed.");
          return;
        }

        setDraft(payload.draft!);
        onImported(payload.draft!);
      } catch {
        setError("Import failed — please try again.");
      }
    });
  }

  return (
    <div className="mb-7 border border-zinc-900 bg-[#11100f]">
      <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3">
        <div>
          <p className="eyebrow text-accent">Import profile</p>
          <p className="mt-1 text-[12px] text-zinc-500">
            Upload a resume or LinkedIn PDF to prefill the setup. You review everything before saving.
          </p>
        </div>
        {draft && (
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-emerald-300">
            Draft applied
          </span>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-300">Resume / LinkedIn PDF</span>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
              className="block w-full text-[12px] text-zinc-500 file:mr-3 file:border file:border-zinc-800 file:bg-zinc-950 file:px-3 file:py-2 file:text-[12px] file:text-zinc-300 hover:file:border-zinc-600"
            />
            {fileName && <p className="mono mt-1 text-[10px] tracking-[0.08em] text-zinc-600">{fileName}</p>}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-300">Or paste LinkedIn / resume text</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={4}
              placeholder="Paste your LinkedIn profile or resume text here..."
              className="input min-h-[100px] resize-y text-[13px]"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleImport}
          disabled={isPending}
          className="btn-primary w-full text-[13px]"
        >
          {isPending ? "Extracting profile…" : "Import and prefill"}
        </button>
        {error && <p className="text-[12px] text-red-400">{error}</p>}
      </div>

      {draft && (
        <div className="border-t border-zinc-900 px-4 py-3">
          <div className="grid gap-3 text-[12px] text-zinc-400 md:grid-cols-3">
            <div>
              <p className="eyebrow mb-1 text-zinc-600">Situation</p>
              <p className="text-zinc-300">{draft.currentRole ?? "Role unknown"}</p>
              <p>{confidenceLabel(draft.confidence.currentSituation)} confidence</p>
            </div>
            <div>
              <p className="eyebrow mb-1 text-zinc-600">Skills</p>
              <p className="text-zinc-300">{draft.primarySkills.length} skills detected</p>
              <p>{confidenceLabel(draft.confidence.skills)} confidence</p>
            </div>
            <div>
              <p className="eyebrow mb-1 text-zinc-600">Goals</p>
              <p className="text-zinc-300">
                {draft.targetRoles.length > 0 ? draft.targetRoles.slice(0, 2).join(", ") : "Needs confirmation"}
              </p>
              <p>{confidenceLabel(draft.confidence.goals)} confidence</p>
            </div>
          </div>
          {draft.notes.length > 0 && (
            <p className="mt-3 text-[12px] leading-relaxed text-zinc-500">{draft.notes.join(" ")}</p>
          )}
        </div>
      )}
    </div>
  );
}
