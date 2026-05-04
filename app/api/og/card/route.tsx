import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { getLatestThreatSnapshot } from "@/lib/data/threat-level";

export const runtime = "nodejs";

function threatColor(score: number): string {
  if (score >= 75) return "#ef4444";
  if (score >= 50) return "#f59e0b";
  if (score >= 25) return "#3b82f6";
  return "#22c55e";
}

function threatLabel(score: number): string {
  if (score >= 75) return "High";
  if (score >= 50) return "Elevated";
  if (score >= 25) return "Moderate";
  return "Low";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("uid");
  if (!userId) {
    return new Response("Missing uid", { status: 400 });
  }

  const [snapshot, rec] = await Promise.all([
    getLatestThreatSnapshot(userId),
    db.careerRecommendation.findFirst({
      where: { userId, isLatest: true },
      select: { biggestOpportunities: true, skillsToAccelerate: true },
    }),
  ]);

  const score = snapshot?.score ?? 0;
  const color = threatColor(score);
  const label = threatLabel(score);
  const topOpportunity = (rec?.biggestOpportunities ?? [])[0] ?? "View your full brief";
  const topSkill =
    ((rec?.skillsToAccelerate ?? []) as { skill: string; urgency: string }[]).find(
      (s) => s.urgency === "now"
    )?.skill ??
    ((rec?.skillsToAccelerate ?? []) as { skill: string }[])[0]?.skill ??
    null;

  const now = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0b1b2b",
          padding: "52px 60px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          justifyContent: "space-between",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#f4f1ea", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Trajectory.io
          </span>
          <span style={{ color: "#6b7280", fontSize: 13 }}>Updated {now}</span>
        </div>

        {/* Score block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ color: "#6b7280", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Career Threat Level
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={{ color, fontSize: 88, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" }}>
              {score}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ color, fontSize: 22, fontWeight: 700 }}>{label}</span>
              <span style={{ color: "#4b5563", fontSize: 13 }}>/ 100</span>
            </div>
          </div>
        </div>

        {/* Opportunity row */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 8,
            padding: "16px 20px",
          }}
        >
          <span style={{ color: "#4ade80", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Top opportunity
          </span>
          <span style={{ color: "#d4d4d8", fontSize: 16, lineHeight: 1.4 }}>{topOpportunity}</span>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {topSkill && (
            <span style={{ color: "#9ca3af", fontSize: 13 }}>
              Skill to accelerate now:{" "}
              <span style={{ color: "#f4f1ea", fontWeight: 600 }}>{topSkill}</span>
            </span>
          )}
          <span style={{ color: "#374151", fontSize: 12 }}>trajectoryapp.io</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 628,
    }
  );
}
