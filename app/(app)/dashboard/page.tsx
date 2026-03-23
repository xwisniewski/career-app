import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/data/dashboard";
import { getLatestThreatSnapshot } from "@/lib/data/threat-level";
import { SignalFeed } from "@/components/dashboard/signal-feed";
import { IntelligenceBrief } from "@/components/dashboard/intelligence-brief";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [{ profile, recommendation, signals }, threatSnapshot] = await Promise.all([
    getDashboardData(session.user.id),
    getLatestThreatSnapshot(session.user.id),
  ]);

  if (!profile) redirect("/login");
  if (!profile.onboardingComplete) redirect("/onboarding");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_300px] gap-6 items-start">
      <SignalFeed signals={signals} />
      <IntelligenceBrief recommendation={recommendation} />
      <QuickActions recommendation={recommendation} profile={profile} threatSnapshot={threatSnapshot} />
    </div>
  );
}
