import "server-only";
import { db } from "@/lib/db";
import { NotificationSeverity, type MacroSignal } from "@/app/generated/prisma/client";
import { sendSignalAlertEmail } from "@/lib/email/signal-alert";

type ProfileForMatch = {
  userId: string;
  currentRole: string | null;
  currentIndustry: string | null;
  targetRoles: string[];
  targetIndustries: string[];
  primarySkills: { name: string }[];
  desiredSkills: string[];
  incomeGoal: number | null;
  user: { name: string | null; email: string | null };
};

function normalized(values: (string | null | undefined)[]): string[] {
  return values
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.toLowerCase().trim());
}

function countMatches(signalValues: string[], profileValues: string[]): number {
  const normalizedSignals = normalized(signalValues);
  return normalizedSignals.filter((signalValue) =>
    profileValues.some(
      (profileValue) => signalValue === profileValue || signalValue.includes(profileValue) || profileValue.includes(signalValue)
    )
  ).length;
}

function severityFor(score: number): NotificationSeverity {
  if (score >= 9) return NotificationSeverity.URGENT;
  if (score >= 7) return NotificationSeverity.IMPORTANT;
  if (score >= 5) return NotificationSeverity.WATCH;
  return NotificationSeverity.INFO;
}

function buildMatch(signal: MacroSignal, profile: ProfileForMatch) {
  const industries = normalized([profile.currentIndustry, ...profile.targetIndustries]);
  const roles = normalized([profile.currentRole, ...profile.targetRoles]);
  const skills = normalized([
    ...profile.primarySkills.map((skill) => skill.name),
    ...profile.desiredSkills,
  ]);

  const industryMatches = countMatches(signal.relevantIndustries, industries);
  const roleMatches = countMatches(signal.relevantRoles, roles);
  const skillMatches = countMatches(signal.relevantSkills, skills);

  const riskBoost = signal.sentiment === "NEGATIVE" ? 2 : 0;
  const opportunityBoost = signal.sentiment === "POSITIVE" ? 1 : 0;
  const magnitudeScore = signal.magnitude * 2;
  const score = magnitudeScore + industryMatches * 3 + roleMatches * 2 + skillMatches + riskBoost + opportunityBoost;

  const matchedParts = [
    industryMatches > 0 ? `${industryMatches} industry match${industryMatches === 1 ? "" : "es"}` : null,
    roleMatches > 0 ? `${roleMatches} role match${roleMatches === 1 ? "" : "es"}` : null,
    skillMatches > 0 ? `${skillMatches} skill match${skillMatches === 1 ? "" : "es"}` : null,
  ].filter((part): part is string => Boolean(part));

  return {
    score,
    severity: severityFor(score),
    matchedParts,
  };
}

function titleFor(signal: MacroSignal): string {
  if (signal.sentiment === "NEGATIVE") return "New career risk signal matched your profile";
  if (signal.sentiment === "POSITIVE") return "New opportunity signal matched your profile";
  return "New macro signal matched your profile";
}

function bodyFor(signal: MacroSignal, matchedParts: string[], incomeGoal: number | null): string {
  const matchText = matchedParts.length > 0 ? `Matched on ${matchedParts.join(", ")}.` : "Matched your profile.";
  const incomeText = incomeGoal
    ? ` Relevance is evaluated against your $${incomeGoal.toLocaleString()} income path.`
    : "";
  return `${matchText} ${signal.headline}${incomeText}`;
}

export async function processSignalNotifications(signalIds: string[]): Promise<{
  created: number;
  emailed: number;
}> {
  const uniqueIds = [...new Set(signalIds)];
  if (uniqueIds.length === 0) return { created: 0, emailed: 0 };

  const [signals, profiles] = await Promise.all([
    db.macroSignal.findMany({ where: { id: { in: uniqueIds } } }),
    db.userProfile.findMany({
      where: { onboardingComplete: true, user: { email: { not: null } } },
      include: {
        primarySkills: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trajectory-io.vercel.app";
  let created = 0;
  let emailed = 0;

  for (const signal of signals) {
    for (const profile of profiles) {
      const match = buildMatch(signal, profile);
      if (match.score < 5) continue;

      const title = titleFor(signal);
      const body = bodyFor(signal, match.matchedParts, profile.incomeGoal);

      const notification = await db.signalNotification
        .create({
          data: {
            userId: profile.userId,
            signalId: signal.id,
            type: "SIGNAL_MATCH",
            severity: match.severity,
            score: match.score,
            title,
            body,
          },
        })
        .catch((error) => {
          const maybePrismaError = error as { code?: string };
          if (maybePrismaError.code === "P2002") return null;
          throw error;
        });

      if (!notification) continue;
      created++;

      if (match.score >= 7 && profile.user.email) {
        const sent = await sendSignalAlertEmail({
          to: profile.user.email,
          userName: profile.user.name?.split(" ")[0] ?? "there",
          title,
          body,
          signalHeadline: signal.headline,
          signalUrl: signal.sourceUrl,
          appUrl,
        });

        if (sent) {
          await db.signalNotification.update({
            where: { id: notification.id },
            data: { emailedAt: new Date() },
          });
          emailed++;
        }
      }
    }
  }

  return { created, emailed };
}
