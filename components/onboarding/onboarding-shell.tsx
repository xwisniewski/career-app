"use client";

import { useState } from "react";
import { ProgressBar } from "./progress-bar";
import { StepSituation } from "./steps/step-situation";
import { StepSkills } from "./steps/step-skills";
import { StepGoals } from "./steps/step-goals";
import { StepPreferences } from "./steps/step-preferences";
import { StepLearning } from "./steps/step-learning";

type NetworkEntry = { industry: string; strength: number };

export type OnboardingProfile = {
  onboardingStep: number;
  // Step 1
  currentRole: string | null;
  currentIndustry: string | null;
  yearsOfExperience: number | null;
  educationLevel: string | null;
  educationField: string | null;
  currentLocation: string | null;
  // Step 2
  primarySkills: { name: string; proficiencyLevel: number; yearsUsed: number | null }[];
  learningSkills: string[];
  desiredSkills: string[];
  // Step 3
  targetRoles: string[];
  targetIndustries: string[];
  targetTimeHorizon: string | null;
  incomeGoal: number | null;
  currentCompensation: number | null;
  // Step 4
  riskTolerance: number | null;
  autonomyVsStatus: number | null;
  ambiguityTolerance: number | null;
  geographicFlexibility: string | null;
  workEnvironmentPreference: string | null;
  familyConstraints: boolean | null;
  visaStatus: string | null;
  entrepreneurialInterest: boolean | null;
  networkStrengthByIndustry: NetworkEntry[] | null;
  // Step 5
  hoursPerWeekForLearning: number | null;
  preferredLearningStyle: string | null;
};

export function OnboardingShell({ profile }: { profile: OnboardingProfile }) {
  const [currentStep, setCurrentStep] = useState(
    Math.max(1, Math.min(profile.onboardingStep + 1, 5))
  );

  const next = () => setCurrentStep((s) => Math.min(s + 1, 5));
  const back = () => setCurrentStep((s) => Math.max(s - 1, 1));

  return (
    <div className="onboarding-terminal flex min-h-screen items-center justify-center bg-[#080706] p-4 text-zinc-200">
      <div className="grid w-full max-w-5xl overflow-hidden border border-zinc-900 bg-[#0b0a09] shadow-2xl shadow-black/40 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden border-r border-zinc-900 p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-10 flex items-center gap-2">
              <span className="h-2 w-2 bg-[rgb(var(--accent))]" />
              <span className="text-[14px] font-semibold text-white">Trajectory.io</span>
            </div>
            <p className="eyebrow mb-4">Profile calibration</p>
            <h1 className="serif max-w-xs text-[42px] font-normal leading-[1.05] tracking-[-0.03em] text-zinc-100">
              Build the signal map for your career market.
            </h1>
            <p className="mt-5 text-[13px] leading-relaxed text-zinc-500">
              Five short sections create the profile used to rank macro signals, threat exposure, and income moves.
            </p>
          </div>
          <div className="mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
            Setup · step {currentStep.toString().padStart(2, "0")} / 05
          </div>
        </aside>

        <div className="p-6 sm:p-8">
          <div className="mb-7 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-[rgb(var(--accent))]" />
              <span className="text-sm font-semibold text-white">Trajectory.io</span>
            </div>
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
              {currentStep} / 5
            </span>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="mb-7">
              <p className="eyebrow mb-2">Onboarding</p>
              <h2 className="serif text-[30px] font-normal leading-tight text-zinc-100">
                Calibrate your trajectory.
              </h2>
            </div>

            <ProgressBar currentStep={currentStep} />

            <div className="border border-zinc-900 bg-[#080706] p-5 sm:p-6">
              {currentStep === 1 && (
                <StepSituation
                  initial={{
                    currentRole: profile.currentRole ?? "",
                    currentIndustry: profile.currentIndustry ?? "",
                    yearsOfExperience: profile.yearsOfExperience ?? 0,
                    educationLevel: profile.educationLevel ?? "",
                    educationField: profile.educationField ?? "",
                    currentLocation: profile.currentLocation ?? "",
                  }}
                  onNext={next}
                />
              )}
              {currentStep === 2 && (
                <StepSkills
                  initial={{
                    primarySkills: profile.primarySkills,
                    learningSkills: profile.learningSkills,
                    desiredSkills: profile.desiredSkills,
                  }}
                  onNext={next}
                  onBack={back}
                />
              )}
              {currentStep === 3 && (
                <StepGoals
                  initial={{
                    targetRoles: profile.targetRoles,
                    targetIndustries: profile.targetIndustries,
                    targetTimeHorizon: profile.targetTimeHorizon ?? "3yr",
                    incomeGoal: profile.incomeGoal ?? 0,
                    currentCompensation: profile.currentCompensation ?? 0,
                  }}
                  onNext={next}
                  onBack={back}
                />
              )}
              {currentStep === 4 && (
                <StepPreferences
                  initial={{
                    riskTolerance: profile.riskTolerance ?? 3,
                    autonomyVsStatus: profile.autonomyVsStatus ?? 3,
                    ambiguityTolerance: profile.ambiguityTolerance ?? 3,
                    geographicFlexibility: profile.geographicFlexibility ?? "NATIONAL",
                    workEnvironmentPreference: profile.workEnvironmentPreference ?? "NO_PREFERENCE",
                    familyConstraints: profile.familyConstraints ?? false,
                    visaStatus: profile.visaStatus ?? "CITIZEN",
                    entrepreneurialInterest: profile.entrepreneurialInterest ?? false,
                    networkStrengthByIndustry: profile.networkStrengthByIndustry ?? [],
                  }}
                  onNext={next}
                  onBack={back}
                />
              )}
              {currentStep === 5 && (
                <StepLearning
                  initial={{
                    hoursPerWeekForLearning: profile.hoursPerWeekForLearning ?? 5,
                    preferredLearningStyle: profile.preferredLearningStyle ?? "MIXED",
                  }}
                  onBack={back}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
