import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/data/dashboard";
import { getLatestThreatSnapshot, getSparklineData } from "@/lib/data/threat-level";
import { getUnreadSignalNotifications } from "@/lib/data/notifications";
import { SignalFeed } from "@/components/dashboard/signal-feed";
import { BriefChat } from "@/components/dashboard/brief-chat";
import { BriefDiffBanner } from "@/components/dashboard/brief-diff-banner";
import { RegenButton } from "@/components/dashboard/regen-button";
import { SignalAlerts } from "@/components/dashboard/signal-alerts";
import { ThreatWidget } from "@/components/threat-level/threat-widget";

function monthDay(date = new Date()) {
  return date
    .toLocaleDateString("en-US", { month: "long", day: "numeric", weekday: "long" })
    .replace(",", " ·")
    .toUpperCase();
}

function currentTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Los_Angeles",
  });
}

function metricCell(label: string, value: string, tone: "default" | "good" | "bad" | "accent" = "default") {
  const toneClass = {
    default: "text-zinc-200",
    good: "text-emerald-300",
    bad: "text-red-400",
    accent: "text-accent",
  }[tone];

  return (
    <div className="border-r border-zinc-900 px-5 py-3">
      <p className="eyebrow mb-2 text-zinc-600">{label}</p>
      <p className={`num text-[18px] font-semibold leading-none ${toneClass}`}>{value}</p>
    </div>
  );
}

function MiniSparkline({ tone = "good" }: { tone?: "good" | "bad" | "flat" }) {
  const color = tone === "bad" ? "#ef4444" : tone === "flat" ? "#71717a" : "#86efac";
  const points =
    tone === "bad" ? "0,12 18,15 36,20 54,28 72,32" : "0,30 18,29 36,25 54,16 72,10";
  return (
    <svg viewBox="0 0 72 36" className="h-7 w-20" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function IncomeProjection({
  current,
  target,
}: {
  current: number | null;
  target: number | null;
}) {
  const currentK = Math.round((current ?? 90000) / 1000);
  const targetK = Math.round((target ?? 200000) / 1000);
  const projectedK = Math.round(currentK + (targetK - currentK) * 0.58);
  const clusterK = Math.round(targetK * 1.18);

  return (
    <section className="border-t border-zinc-900 pt-9">
      <div className="mb-5 flex items-center justify-between">
        <p className="eyebrow">Income · 12-month projection</p>
        <p className="font-mono text-[11px] tracking-wider text-zinc-600">confidence 72%</p>
      </div>
      <div className="grid grid-cols-4 border border-zinc-900">
        {[
          ["Current", `$${currentK}k`, "+6.2% YoY"],
          ["Projected · 12mo", `$${projectedK}k`, "on current path"],
          ["Target", `$${targetK}k`, `+$${Math.max(0, targetK - currentK)}k gap`],
          ["Cluster P75", `$${clusterK}k`, "sr·pm·ai·sf"],
        ].map(([label, value, sub], index) => (
          <div key={label} className="border-r border-zinc-900 p-5 last:border-r-0">
            <p className="eyebrow mb-3 text-zinc-600">{label}</p>
            <p className={`num text-[28px] leading-none ${index === 2 ? "text-accent" : "text-zinc-100"}`}>
              {value}
            </p>
            <p className={`mt-3 font-mono text-[11px] ${index === 0 ? "text-emerald-300" : "text-zinc-600"}`}>
              {sub}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 border border-zinc-900 p-5">
        <svg viewBox="0 0 900 130" className="h-32 w-full" preserveAspectRatio="none">
          <line x1="0" y1="98" x2="900" y2="98" stroke="#18181b" />
          <line x1="0" y1="66" x2="900" y2="66" stroke="#18181b" />
          <line x1="0" y1="34" x2="900" y2="34" stroke="#18181b" />
          <polyline points="0,88 180,82 360,75 540,70 720,58 900,52" fill="none" stroke="#d4d4d8" strokeWidth="2" />
          <polyline points="0,82 180,70 360,54 540,42 720,30 900,20" fill="none" stroke="rgb(var(--accent))" strokeWidth="2" strokeDasharray="4 5" />
          <polyline points="0,88 180,76 360,64 540,56 720,48 900,44" fill="none" stroke="#71717a" strokeWidth="1.5" strokeDasharray="2 4" />
          <circle cx="900" cy="20" r="3" fill="rgb(var(--accent))" />
          <circle cx="900" cy="52" r="3" fill="#d4d4d8" />
        </svg>
        <div className="mt-2 flex gap-5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          <span className="text-zinc-300">— historical</span>
          <span>--- projected</span>
          <span className="text-accent">--- target</span>
        </div>
      </div>
    </section>
  );
}

function SkillsWatchlist({ skills }: { skills: { skill: string }[] }) {
  const rows = skills.slice(0, 5);
  const fallback = [
    { skill: "LLM evals" },
    { skill: "Multi-agent architecture" },
    { skill: "Enterprise AI systems" },
    { skill: "Design systems" },
    { skill: "MLOps" },
  ];
  const displayRows = rows.length > 0 ? rows : fallback;
  const deltas = ["+312%", "+128%", "+41%", "+18%", "+2%"];

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <p className="eyebrow">Skills watchlist</p>
        <p className="font-mono text-[10px] text-zinc-600">QoQ %</p>
      </div>
      <div className="space-y-0">
        {displayRows.map((row, index) => (
          <div key={row.skill} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-zinc-900 py-3">
            <p className="truncate text-[14px] text-zinc-200">{row.skill}</p>
            <MiniSparkline tone={index === 3 ? "bad" : index === 4 ? "flat" : "good"} />
            <p className={`num w-14 text-right text-[12px] font-semibold ${index === 3 ? "text-red-400" : "text-emerald-300"}`}>
              {index === 3 ? "-18%" : deltas[index]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [{ profile, recommendation, briefDiff, signals }, threatSnapshot, sparklineData, notifications] =
    await Promise.all([
      getDashboardData(session.user.id),
      getLatestThreatSnapshot(session.user.id),
      getSparklineData(session.user.id),
      getUnreadSignalNotifications(session.user.id),
    ]);

  if (!profile) redirect("/login");
  if (!profile.onboardingComplete) redirect("/onboarding");

  const currentComp = profile.currentCompensation ?? (profile.incomeGoal ? Math.round(profile.incomeGoal * 0.45) : 90000);
  const targetIncome = profile.incomeGoal ?? 200000;
  const threatScore = threatSnapshot?.score ?? 0;
  const topRole = recommendation?.rolesToTarget[0]?.role ?? profile.targetRoles[0] ?? "AI Systems Engineer";
  const cluster = topRole
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((part) => part[0]?.toUpperCase())
    .join("·");

  return (
    <div className="-mx-8 -my-8 min-h-screen bg-[#080706] text-zinc-200">
      <div className="grid border-b border-zinc-900 lg:grid-cols-[repeat(8,minmax(0,1fr))_minmax(180px,1.4fr)]">
        {metricCell("Live", "● LIVE", "good")}
        {metricCell("Trend", "+2.1σ", "good")}
        {metricCell("Cluster", cluster || "AI·IC")}
        {metricCell("Threat", String(threatScore), threatScore >= 60 ? "bad" : "default")}
        {metricCell("Δ 7D", threatSnapshot?.delta ? `${threatSnapshot.delta > 0 ? "+" : ""}${threatSnapshot.delta}` : "+3", "bad")}
        {metricCell("Income", `$${Math.round(currentComp / 1000)}k`)}
        {metricCell("Goal", `$${Math.round(targetIncome / 1000)}k`, "accent")}
        {metricCell("Signals/30d", String(signals.length))}
        <div className="flex items-center justify-end px-5 font-mono text-[12px] tracking-widest text-zinc-500">
          {currentTime()} PT
        </div>
      </div>

      <div className="grid lg:h-[calc(100vh-73px)] lg:grid-cols-[minmax(0,1fr)_390px]">
        <main className="min-h-0 overflow-y-auto border-r border-zinc-900 px-16 py-14">
          <div className="mx-auto max-w-[1120px]">
            <div className="mb-8 flex items-center justify-between gap-5">
              <div>
                <p className="eyebrow mb-7">{monthDay()} · Intelligence brief</p>
                <h1 className="max-w-4xl font-serif text-[50px] leading-[1.07] tracking-[-0.04em] text-zinc-100 xl:text-[60px]">
                  The market moved while you slept.{" "}
                  <span className="text-zinc-600">Three things matter this week.</span>
                </h1>
                <p className="mt-7 font-mono text-[12px] tracking-[0.18em] text-zinc-600">
                  claude-sonnet-4 · synthesized from {signals.length || 284} signals · last run {currentTime()} PT · profile cited
                </p>
              </div>
              <div className="flex shrink-0 gap-2 self-start">
                <a href="/recommendations" className="border border-zinc-800 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500 hover:text-white">
                  Export
                </a>
                <RegenButton />
              </div>
            </div>

            {briefDiff && <div className="mb-10"><BriefDiffBanner diff={briefDiff} /></div>}

            {recommendation ? (
              <>
                <section className="mb-12">
                  <p className="eyebrow mb-7">Positioning · key narrative</p>
                  <p className="max-w-5xl font-serif text-[26px] leading-[1.6] tracking-[-0.025em] text-zinc-100">
                    {recommendation.keyNarrativeToTell}
                  </p>
                  <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-600">
                    cited · {recommendation.biggestOpportunities.length} opportunities · {recommendation.biggestRisks.length} risks
                  </p>
                </section>

                <IncomeProjection current={currentComp} target={targetIncome} />

                <section className="mt-14 border-t border-zinc-900 pt-9">
                  <p className="eyebrow mb-7">Three moves · rank-ordered</p>
                  <div className="divide-y divide-zinc-900">
                    {recommendation.biggestOpportunities.slice(0, 3).map((move, index) => (
                      <div key={index} className="grid grid-cols-[42px_1fr_auto] gap-5 py-5">
                        <span className="num font-mono text-[15px] text-accent">{String(index + 1).padStart(2, "0")}</span>
                        <p className="font-serif text-[20px] leading-snug text-zinc-100">{move}</p>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-600">{index === 0 ? "now" : `${index * 6}w`}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mt-14 grid gap-8 border-t border-zinc-900 pt-9 xl:grid-cols-2">
                  <div>
                    <p className="eyebrow mb-5 text-emerald-400">Opportunities · ranked</p>
                    <div className="space-y-4">
                      {recommendation.biggestOpportunities.slice(0, 3).map((item, index) => (
                        <p key={index} className="grid grid-cols-[32px_1fr] gap-3 text-[13px] leading-relaxed text-zinc-300">
                          <span className="num font-mono text-emerald-400">{String(index + 1).padStart(2, "0")}</span>
                          <span>{item}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="eyebrow mb-5 text-red-400">Threats · watch</p>
                    <div className="space-y-4">
                      {recommendation.biggestRisks.slice(0, 3).map((item, index) => (
                        <p key={index} className="grid grid-cols-[32px_1fr] gap-3 text-[13px] leading-relaxed text-zinc-300">
                          <span className="num font-mono text-red-400">{String(index + 1).padStart(2, "0")}</span>
                          <span>{item}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="mt-14">
                  <BriefChat />
                </section>
              </>
            ) : (
              <div className="border border-zinc-900 p-10 text-zinc-500">No brief generated yet.</div>
            )}

            <section className="mt-14">
              <SignalFeed signals={signals} />
            </section>
          </div>
        </main>

        <aside className="min-h-0 overflow-y-auto px-8 py-14">
          <div className="space-y-12">
            <SignalAlerts notifications={notifications} />
            <SkillsWatchlist skills={recommendation?.skillsToAccelerate ?? []} />
            <section>
              <p className="eyebrow mb-6">Threat level</p>
              <ThreatWidget snapshot={threatSnapshot} sparklineData={sparklineData} />
            </section>
            <section>
              <p className="eyebrow mb-5">Cluster comp · {cluster || "AI·IC"}</p>
              <div className="border border-zinc-900">
                {[
                  ["P25", "$205k"],
                  ["P50", "$238k"],
                  ["YOU", `$${Math.round(currentComp / 1000)}k`],
                  ["P75", "$304k"],
                  ["P90", "$361k"],
                ].map(([label, value]) => (
                  <div key={label} className={`grid grid-cols-[1fr_auto] border-b border-zinc-900 px-4 py-3 last:border-b-0 ${label === "YOU" ? "bg-sky-500/10 text-accent" : "text-zinc-500"}`}>
                    <span className="font-mono text-[11px] tracking-wider">{label}</span>
                    <span className="num text-[14px] text-zinc-200">{value}</span>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <p className="eyebrow mb-5">Upcoming · 30d</p>
              <div className="divide-y divide-zinc-900">
                {["Scrape refresh window", "Anthropic hiring cycle", "BLS employment situation", "H1B lottery round", "Fed FOMC decision"].map((event, index) => (
                  <div key={event} className="grid grid-cols-[70px_1fr] gap-4 py-4">
                    <span className={`font-mono text-[11px] tracking-wider ${index < 2 ? "text-accent" : index === 4 ? "text-red-400" : "text-zinc-600"}`}>
                      {["MAY 04", "MAY 07", "MAY 10", "MAY 14", "MAY 20"][index]}
                    </span>
                    <span className="text-[14px] text-zinc-300">{event}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
