import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/data/dashboard";
import { getLatestThreatSnapshot, getSparklineData } from "@/lib/data/threat-level";
import { getUnreadSignalNotifications } from "@/lib/data/notifications";
import { SignalFeed } from "@/components/dashboard/signal-feed";
import { IntelligenceBrief } from "@/components/dashboard/intelligence-brief";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SignalAlerts } from "@/components/dashboard/signal-alerts";

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

  return (
    <div className="grid grid-cols-1 gap-6 lg:h-[calc(100vh-64px)] lg:overflow-hidden lg:grid-cols-[minmax(280px,0.85fr)_minmax(460px,1.25fr)_340px] 2xl:grid-cols-[minmax(340px,0.9fr)_minmax(560px,1.35fr)_360px]">
      <SignalFeed signals={signals} />
      <IntelligenceBrief recommendation={recommendation} briefDiff={briefDiff} />
      <div className="flex min-h-0 flex-col gap-4 pr-1 lg:overflow-y-auto">
        <SignalAlerts notifications={notifications} />
        <QuickActions
          recommendation={recommendation}
          profile={profile}
          threatSnapshot={threatSnapshot}
          sparklineData={sparklineData}
        />
      </div>
    </div>
  );
}
