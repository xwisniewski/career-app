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
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep} of {STEPS.length}
        </span>
        <span className="text-sm text-gray-500">{STEPS[currentStep - 1]}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`text-xs ${
              i + 1 <= currentStep ? "text-gray-900 font-medium" : "text-gray-400"
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
