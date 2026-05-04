import "server-only";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { getLatestThreatSnapshot } from "@/lib/data/threat-level";

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  return new Resend(process.env.RESEND_API_KEY);
}

function threatLabel(score: number): string {
  if (score >= 75) return "High";
  if (score >= 50) return "Elevated";
  if (score >= 25) return "Moderate";
  return "Low";
}

function buildHtml(params: {
  userName: string;
  score: number;
  delta: number | null;
  topOpportunities: string[];
  topRisk: string | null;
  topSkill: string | null;
  appUrl: string;
}): string {
  const { userName, score, delta, topOpportunities, topRisk, topSkill, appUrl } = params;
  const label = threatLabel(score);
  const deltaStr =
    delta !== null ? (delta > 0 ? `+${delta} pts` : delta < 0 ? `${delta} pts` : "unchanged") : "";

  const opportunityRows = topOpportunities
    .slice(0, 2)
    .map((o) => `<li style="margin-bottom:6px;color:#d4d4d8;font-size:13px;">${o}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your Weekly Intelligence Brief</title></head>
<body style="background:#0b1b2b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;margin:0 auto;">
    <tr><td>
      <p style="color:#6b7280;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 24px;">
        Trajectory.io · Weekly Brief
      </p>

      <h1 style="color:#f4f1ea;font-size:24px;font-weight:600;margin:0 0 6px;letter-spacing:-0.02em;">
        Good morning, ${userName}.
      </h1>
      <p style="color:#9ca3af;font-size:14px;margin:0 0 32px;">
        Here's your career intelligence update for the week.
      </p>

      <!-- Threat score -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#111827;border:1px solid #1f2937;border-radius:8px;margin-bottom:20px;">
        <tr><td style="padding:20px;">
          <p style="color:#6b7280;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px;">Threat Level</p>
          <p style="color:#f4f1ea;font-size:36px;font-weight:700;margin:0;letter-spacing:-0.03em;">
            ${score}
            <span style="font-size:16px;font-weight:400;color:#9ca3af;margin-left:4px;">/100 — ${label}</span>
          </p>
          ${deltaStr ? `<p style="color:${delta! > 0 ? "#f87171" : "#4ade80"};font-size:13px;margin:6px 0 0;">${deltaStr} since last week</p>` : ""}
        </td></tr>
      </table>

      ${
        opportunityRows
          ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#052e16;border:1px solid #14532d;border-radius:8px;margin-bottom:20px;">
        <tr><td style="padding:20px;">
          <p style="color:#4ade80;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 12px;">Top Opportunities</p>
          <ul style="margin:0;padding-left:16px;">${opportunityRows}</ul>
        </td></tr>
      </table>`
          : ""
      }

      ${
        topRisk
          ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#2d0a0a;border:1px solid #7f1d1d;border-radius:8px;margin-bottom:20px;">
        <tr><td style="padding:20px;">
          <p style="color:#f87171;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px;">Top Risk</p>
          <p style="color:#fca5a5;font-size:13px;margin:0;">${topRisk}</p>
        </td></tr>
      </table>`
          : ""
      }

      ${
        topSkill
          ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#111827;border:1px solid #1f2937;border-radius:8px;margin-bottom:28px;">
        <tr><td style="padding:20px;">
          <p style="color:#6b7280;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px;">Skill to Accelerate This Week</p>
          <p style="color:#f4f1ea;font-size:15px;font-weight:600;margin:0;">${topSkill}</p>
        </td></tr>
      </table>`
          : ""
      }

      <a href="${appUrl}/dashboard" style="display:block;background:#f2b544;color:#0b1b2b;text-align:center;padding:14px;border-radius:6px;font-weight:600;font-size:14px;text-decoration:none;margin-bottom:32px;">
        View full brief →
      </a>

      <p style="color:#374151;font-size:11px;text-align:center;margin:0;">
        Trajectory.io · <a href="${appUrl}/profile" style="color:#4b5563;text-decoration:none;">Update preferences</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendWeeklyDigests(): Promise<{ sent: number; errors: number }> {
  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://career-app-bice.vercel.app";

  // Fetch all users with complete profiles and email addresses
  const users = await db.user.findMany({
    where: {
      email: { not: null },
      profile: { onboardingComplete: true },
    },
    select: {
      id: true,
      name: true,
      email: true,
      recommendations: {
        where: { isLatest: true },
        orderBy: { generatedAt: "desc" },
        take: 1,
        select: {
          biggestOpportunities: true,
          biggestRisks: true,
          skillsToAccelerate: true,
        },
      },
    },
  });

  let sent = 0;
  let errors = 0;

  for (const user of users) {
    if (!user.email) continue;

    const snapshot = await getLatestThreatSnapshot(user.id);
    const rec = user.recommendations[0] ?? null;

    const html = buildHtml({
      userName: user.name?.split(" ")[0] ?? "there",
      score: snapshot?.score ?? 0,
      delta: snapshot?.delta ?? null,
      topOpportunities: rec?.biggestOpportunities ?? [],
      topRisk: (rec?.biggestRisks ?? [])[0] ?? null,
      topSkill:
        ((rec?.skillsToAccelerate ?? []) as { skill: string; urgency: string }[]).find(
          (s) => s.urgency === "now"
        )?.skill ??
        ((rec?.skillsToAccelerate ?? []) as { skill: string }[])[0]?.skill ??
        null,
      appUrl,
    });

    try {
      await resend.emails.send({
        from: "Trajectory.io <onboarding@resend.dev>",
        to: user.email,
        subject: `Your weekly brief — Threat Level ${snapshot?.score ?? "N/A"}`,
        html,
      });
      sent++;
    } catch {
      errors++;
    }
  }

  return { sent, errors };
}
