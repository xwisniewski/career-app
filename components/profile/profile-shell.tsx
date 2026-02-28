"use client";

import { useState } from "react";
import { SituationSection } from "./sections/situation-section";
import { SkillsSection } from "./sections/skills-section";
import { GoalsSection } from "./sections/goals-section";
import { PreferencesSection } from "./sections/preferences-section";
import { LearningSection } from "./sections/learning-section";

const TABS = [
  { id: "situation", label: "Situation" },
  { id: "skills", label: "Skills" },
  { id: "goals", label: "Goals" },
  { id: "preferences", label: "Preferences" },
  { id: "learning", label: "Learning" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type ProfileData = {
  currentRole: string;
  currentIndustry: string;
  yearsOfExperience: number;
  educationLevel: string;
  educationField: string;
  currentLocation: string;
  primarySkills: { name: string; proficiencyLevel: number; yearsUsed: number | null }[];
  learningSkills: string[];
  desiredSkills: string[];
  targetRoles: string[];
  targetIndustries: string[];
  targetTimeHorizon: string;
  incomeGoal: number;
  currentCompensation: number;
  riskTolerance: number;
  autonomyVsStatus: number;
  ambiguityTolerance: number;
  geographicFlexibility: string;
  workEnvironmentPreference: string;
  familyConstraints: boolean;
  visaStatus: string;
  entrepreneurialInterest: boolean;
  networkStrengthByIndustry: { industry: string; strength: number }[];
  hoursPerWeekForLearning: number;
  preferredLearningStyle: string;
};

export function ProfileShell({ data }: { data: ProfileData }) {
  const [activeTab, setActiveTab] = useState<TabId>("situation");

  return (
    <div className="flex gap-8 items-start">
      {/* Sidebar nav */}
      <aside className="w-36 shrink-0 flex flex-col gap-1 sticky top-20">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </aside>

      {/* Section content */}
      <div className="flex-1 min-w-0">
        {activeTab === "situation" && (
          <SituationSection
            initial={{
              currentRole: data.currentRole,
              currentIndustry: data.currentIndustry,
              yearsOfExperience: data.yearsOfExperience,
              educationLevel: data.educationLevel,
              educationField: data.educationField,
              currentLocation: data.currentLocation,
            }}
          />
        )}
        {activeTab === "skills" && (
          <SkillsSection
            initial={{
              primarySkills: data.primarySkills,
              learningSkills: data.learningSkills,
              desiredSkills: data.desiredSkills,
            }}
          />
        )}
        {activeTab === "goals" && (
          <GoalsSection
            initial={{
              targetRoles: data.targetRoles,
              targetIndustries: data.targetIndustries,
              targetTimeHorizon: data.targetTimeHorizon,
              incomeGoal: data.incomeGoal,
              currentCompensation: data.currentCompensation,
            }}
          />
        )}
        {activeTab === "preferences" && (
          <PreferencesSection
            initial={{
              riskTolerance: data.riskTolerance,
              autonomyVsStatus: data.autonomyVsStatus,
              ambiguityTolerance: data.ambiguityTolerance,
              geographicFlexibility: data.geographicFlexibility,
              workEnvironmentPreference: data.workEnvironmentPreference,
              familyConstraints: data.familyConstraints,
              visaStatus: data.visaStatus,
              entrepreneurialInterest: data.entrepreneurialInterest,
              networkStrengthByIndustry: data.networkStrengthByIndustry,
            }}
          />
        )}
        {activeTab === "learning" && (
          <LearningSection
            initial={{
              hoursPerWeekForLearning: data.hoursPerWeekForLearning,
              preferredLearningStyle: data.preferredLearningStyle,
            }}
          />
        )}
      </div>
    </div>
  );
}
