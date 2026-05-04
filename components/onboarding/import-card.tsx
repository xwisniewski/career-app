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
      setError("Upload a PDF or paste your resume / LinkedIn text below.");
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

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name ?? "");
    setText("");
  }

  return (
    <div className="mb-7 border border-zinc-800 bg-[#0e0d0c]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
        <div>
          <p className="eyebrow text-accent">Quick import</p>
          <p className="mt-0.5 text-[12px] text-zinc-500">
            Prefill from your resume or LinkedIn — you review before saving.
          </p>
        </div>
        {draft && (
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-emerald-400">
            ✓ Applied
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Option A — File upload */}
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-500">
            Option A — Upload PDF or DOCX
          </p>
          <div
            className="flex cursor-pointer items-center gap-3 border border-dashed border-zinc-700 px-4 py-3 hover:border-zinc-500 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <svg className="h-4 w-4 shrink-0 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
            <span className="text-[13px] text-zinc-400">
              {fileName ? (
                <span className="text-zinc-200">{fileName}</span>
              ) : (
                "Choose file…"
              )}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-600">or</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Option B — Paste text */}
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-500">
            Option B — Paste resume or LinkedIn text
          </p>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setFileName(""); if (fileRef.current) fileRef.current.value = ""; }}
            rows={5}
            placeholder="Paste the text from your LinkedIn profile or resume here..."
            className="input w-full resize-y text-[13px] leading-relaxed"
          />
        </div>

        {/* Submit */}
        {error && <p className="text-[12px] text-red-400">{error}</p>}
        <button
          type="button"
          onClick={handleImport}
          disabled={isPending}
          className="btn-primary w-full"
        >
          {isPending ? "Extracting profile…" : "Autofill from resume"}
        </button>
      </div>

      {/* Result preview */}
      {draft && (
        <div className="border-t border-zinc-800 px-5 py-3">
          <div className="grid gap-3 text-[12px] text-zinc-400 sm:grid-cols-3">
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
