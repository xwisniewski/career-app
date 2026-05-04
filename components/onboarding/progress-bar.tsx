"use client";

const STEPS = [
  "Situation",
  "Skills",
  "Goals",
  "Preferences",
  "Learning",
];

export function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between">
        <span className="mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
          Step {currentStep} of {STEPS.length}
        </span>
        <span className="eyebrow text-accent">{STEPS[currentStep - 1]}</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-900">
        <div
          className="h-1.5 bg-[rgb(var(--accent))] transition-all duration-300"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`mono text-[10px] ${
              i + 1 <= currentStep ? "text-zinc-200" : "text-zinc-700"
            }`}
          >
            {String(i + 1).padStart(2, "0")}
          </div>
        ))}
      </div>
    </div>
  );
}
