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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Career Intelligence
          </h1>
        </div>

        <ProgressBar currentStep={currentStep} />

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
  );
}
