/**
 * Shared types for the Threat Level feature.
 *
 * Architecture: the scoring model is pluggable — each ThreatSignalSource
 * contributes a bounded slice of the 0–100 score. Adding a new data source
 * (e.g. Lightcast job postings, BLS OES) means implementing ThreatSignalSource
 * and registering it in score.ts — no rewiring of the core.
 */

import type { MacroSignal, OccupationExposure, UserProfile, PrimarySkill } from "@/app/generated/prisma/client";

// ─── Input context passed to every scoring source ─────────────────────────────

export type ScoringContext = {
  profile: UserProfile & { primarySkills: PrimarySkill[] };
  signals: MacroSignal[];
  /** Best-matched O*NET occupation, or null if no match found. */
  occupationExposure: OccupationExposure | null;
};

// ─── Per-source output ────────────────────────────────────────────────────────

/** A macro signal that is pushing the threat score up. */
export type SignalDriver = {
  signalId: string;
  headline: string;
  category: string;
  contribution: number; // points this signal adds to the composite score
  /** One sentence, personalized to the user's role/industry. */
  explanation: string;
};

/** A macro signal that is reducing the threat score. */
export type Counterfactor = {
  signalId: string;
  headline: string;
  category: string;
  pointsOffset: number; // points this signal subtracts (positive number = risk reduction)
  explanation: string;
};

export type SourceResult = {
  /** Points scored by this source (clamped to [0, maxPoints]). */
  score: number;
  drivers: SignalDriver[];
  counterfactors: Counterfactor[];
};

// ─── Pluggable source interface ───────────────────────────────────────────────

export interface ThreatSignalSource {
  /** Human-readable name (used in logs and future admin UI). */
  readonly name: string;
  /** Maximum points this source can contribute. All sources sum to 100. */
  readonly maxPoints: number;
  compute(ctx: ScoringContext): Promise<SourceResult>;
}

// ─── Composite result ─────────────────────────────────────────────────────────

export type ThreatScoreResult = {
  score: number; // 0–100 composite
  roleRisk: number; // 0–40 from OccupationExposureSource
  industryRisk: number; // 0–25 from IndustryRiskSource
  skillsGap: number; // 0–25 from SkillsGapSource
  companyTypeRisk: number; // 0–10 from CompanyTypeRiskSource
  matchedOccupation: string | null;
  exposureScore: number | null;
  signalDrivers: SignalDriver[];
  counterfactors: Counterfactor[];
};

// ─── HuggingFace dataset row ──────────────────────────────────────────────────

/** Raw row shape from Anthropic/EconomicIndex dataset (HuggingFace Datasets Server API). */
export type HFExposureRow = {
  onet_soc_code?: string;
  onetsoccode?: string;
  title?: string;
  occupation_title?: string;
  observed_exposure?: number;
  observedexposure?: number;
  theoretical_exposure?: number;
  theoreticalexposure?: number;
  [key: string]: unknown;
};
