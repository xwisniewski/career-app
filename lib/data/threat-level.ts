import "server-only";
import { db } from "@/lib/db";
import type { SignalDriver, Counterfactor } from "@/lib/threat-level/types";

export type ThreatLevelSnapshotRow = {
  id: string;
  date: string;
  score: number;
  previousScore: number | null;
  delta: number | null;
  roleRisk: number;
  industryRisk: number;
  skillsGap: number;
  companyTypeRisk: number;
  matchedOccupation: string | null;
  exposureScore: number | null;
  signalDrivers: SignalDriver[];
  counterfactors: Counterfactor[];
  recommendedAction: string;
  computedAt: string;
};

export type SparklinePoint = { date: string; score: number };

export async function getLatestThreatSnapshot(
  userId: string
): Promise<ThreatLevelSnapshotRow | null> {
  const snapshot = await db.threatLevelSnapshot.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });

  if (!snapshot) return null;
  return toRow(snapshot);
}

export async function getSparklineData(userId: string): Promise<SparklinePoint[]> {
  const snapshots = await db.threatLevelSnapshot.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    take: 30,
    select: { date: true, score: true },
  });

  return snapshots.map((s) => ({
    date: s.date.toISOString().split("T")[0],
    score: s.score,
  }));
}

export async function saveThreatSnapshot(params: {
  userId: string;
  date: Date;
  score: number;
  previousScore: number | null;
  roleRisk: number;
  industryRisk: number;
  skillsGap: number;
  companyTypeRisk: number;
  matchedOccupation: string | null;
  exposureScore: number | null;
  signalDrivers: SignalDriver[];
  counterfactors: Counterfactor[];
  recommendedAction: string;
}): Promise<string> {
  const normalizedDate = startOfDay(params.date);

  const snapshot = await db.threatLevelSnapshot.upsert({
    where: { userId_date: { userId: params.userId, date: normalizedDate } },
    create: {
      userId: params.userId,
      date: normalizedDate,
      score: params.score,
      previousScore: params.previousScore,
      roleRisk: params.roleRisk,
      industryRisk: params.industryRisk,
      skillsGap: params.skillsGap,
      companyTypeRisk: params.companyTypeRisk,
      matchedOccupation: params.matchedOccupation,
      exposureScore: params.exposureScore,
      signalDrivers: params.signalDrivers,
      counterfactors: params.counterfactors,
      recommendedAction: params.recommendedAction,
    },
    update: {
      score: params.score,
      previousScore: params.previousScore,
      roleRisk: params.roleRisk,
      industryRisk: params.industryRisk,
      skillsGap: params.skillsGap,
      companyTypeRisk: params.companyTypeRisk,
      matchedOccupation: params.matchedOccupation,
      exposureScore: params.exposureScore,
      signalDrivers: params.signalDrivers,
      counterfactors: params.counterfactors,
      recommendedAction: params.recommendedAction,
      computedAt: new Date(),
    },
  });

  return snapshot.id;
}

/** Get the previous snapshot's score for delta calculation. */
export async function getPreviousScore(
  userId: string,
  beforeDate: Date
): Promise<number | null> {
  const prev = await db.threatLevelSnapshot.findFirst({
    where: { userId, date: { lt: beforeDate } },
    orderBy: { date: "desc" },
    select: { score: true },
  });
  return prev?.score ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function toRow(s: {
  id: string;
  date: Date;
  score: number;
  previousScore: number | null;
  roleRisk: number;
  industryRisk: number;
  skillsGap: number;
  companyTypeRisk: number;
  matchedOccupation: string | null;
  exposureScore: number | null;
  signalDrivers: unknown;
  counterfactors: unknown;
  recommendedAction: string;
  computedAt: Date;
}): ThreatLevelSnapshotRow {
  return {
    id: s.id,
    date: s.date.toISOString().split("T")[0],
    score: s.score,
    previousScore: s.previousScore,
    delta: s.previousScore !== null ? s.score - s.previousScore : null,
    roleRisk: s.roleRisk,
    industryRisk: s.industryRisk,
    skillsGap: s.skillsGap,
    companyTypeRisk: s.companyTypeRisk,
    matchedOccupation: s.matchedOccupation,
    exposureScore: s.exposureScore,
    signalDrivers: s.signalDrivers as SignalDriver[],
    counterfactors: s.counterfactors as Counterfactor[],
    recommendedAction: s.recommendedAction,
    computedAt: s.computedAt.toISOString(),
  };
}
