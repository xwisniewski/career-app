"use client";

import { useState } from "react";
import { ProgressBar } from "./progress-bar";
import { StepSituation } from "./steps/step-situation";
import { StepSkills } from "./steps/step-skills";
import { StepGoals } from "./steps/step-goals";
import { StepPreferences } from "./steps/step-preferences";
import { StepLearning } from "./steps/step-learning";
import { ImportCard, type ProfileImportDraft } from "./import-card";

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
  const [draftProfile, setDraftProfile] = useState(profile);
  const [importVersion, setImportVersion] = useState(0);
  const [currentStep, setCurrentStep] = useState(
    Math.max(1, Math.min(profile.onboardingStep + 1, 5))
  );

  const next = () => setCurrentStep((s) => Math.min(s + 1, 5));
  const back = () => setCurrentStep((s) => Math.max(s - 1, 1));

  function applyImportDraft(draft: ProfileImportDraft) {
    setDraftProfile((prev) => ({
      ...prev,
      currentRole: draft.currentRole ?? prev.currentRole,
      currentIndustry: draft.currentIndustry ?? prev.currentIndustry,
      yearsOfExperience: draft.yearsOfExperience ?? prev.yearsOfExperience,
      educationLevel: draft.educationLevel ?? prev.educationLevel,
      educationField: draft.educationField ?? prev.educationField,
      currentLocation: draft.currentLocation ?? prev.currentLocation,
      primarySkills: draft.primarySkills.length > 0 ? draft.primarySkills : prev.primarySkills,
      learningSkills: draft.learningSkills.length > 0 ? draft.learningSkills : prev.learningSkills,
      desiredSkills: draft.desiredSkills.length > 0 ? draft.desiredSkills : prev.desiredSkills,
      targetRoles: draft.targetRoles.length > 0 ? draft.targetRoles : prev.targetRoles,
      targetIndustries: draft.targetIndustries.length > 0 ? draft.targetIndustries : prev.targetIndustries,
      networkStrengthByIndustry:
        draft.networkStrengthByIndustry.length > 0
          ? draft.networkStrengthByIndustry
          : prev.networkStrengthByIndustry,
    }));
    setImportVersion((version) => version + 1);
    setCurrentStep(1);
  }

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

            <ImportCard onImported={applyImportDraft} />

            <div
              key={`${importVersion}-${currentStep}`}
              className="border border-zinc-900 bg-[#080706] p-5 sm:p-6"
            >
              {currentStep === 1 && (
                <StepSituation
                  initial={{
                    currentRole: draftProfile.currentRole ?? "",
                    currentIndustry: draftProfile.currentIndustry ?? "",
                    yearsOfExperience: draftProfile.yearsOfExperience ?? 0,
                    educationLevel: draftProfile.educationLevel ?? "",
                    educationField: draftProfile.educationField ?? "",
                    currentLocation: draftProfile.currentLocation ?? "",
                  }}
                  onNext={next}
                />
              )}
              {currentStep === 2 && (
                <StepSkills
                  initial={{
                    primarySkills: draftProfile.primarySkills,
                    learningSkills: draftProfile.learningSkills,
                    desiredSkills: draftProfile.desiredSkills,
                  }}
                  onNext={next}
                  onBack={back}
                />
              )}
              {currentStep === 3 && (
                <StepGoals
                  initial={{
                    targetRoles: draftProfile.targetRoles,
                    targetIndustries: draftProfile.targetIndustries,
                    targetTimeHorizon: draftProfile.targetTimeHorizon ?? "3yr",
                    incomeGoal: draftProfile.incomeGoal ?? 0,
                    currentCompensation: draftProfile.currentCompensation ?? 0,
                  }}
                  onNext={next}
                  onBack={back}
                />
              )}
              {currentStep === 4 && (
                <StepPreferences
                  initial={{
                    riskTolerance: draftProfile.riskTolerance ?? 3,
                    autonomyVsStatus: draftProfile.autonomyVsStatus ?? 3,
                    ambiguityTolerance: draftProfile.ambiguityTolerance ?? 3,
                    geographicFlexibility: draftProfile.geographicFlexibility ?? "NATIONAL",
                    workEnvironmentPreference: draftProfile.workEnvironmentPreference ?? "NO_PREFERENCE",
                    familyConstraints: draftProfile.familyConstraints ?? false,
                    visaStatus: draftProfile.visaStatus ?? "CITIZEN",
                    entrepreneurialInterest: draftProfile.entrepreneurialInterest ?? false,
                    networkStrengthByIndustry: draftProfile.networkStrengthByIndustry ?? [],
                  }}
                  onNext={next}
                  onBack={back}
                />
              )}
              {currentStep === 5 && (
                <StepLearning
                  initial={{
                    hoursPerWeekForLearning: draftProfile.hoursPerWeekForLearning ?? 5,
                    preferredLearningStyle: draftProfile.preferredLearningStyle ?? "MIXED",
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
