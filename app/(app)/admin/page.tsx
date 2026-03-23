import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminPageData } from "@/lib/data/admin";
import { StatsBar } from "@/components/admin/stats-bar";
import { SignalBreakdown } from "@/components/admin/signal-breakdown";
import { ScrapingRunsTable } from "@/components/admin/scraping-runs-table";
import { UsersTable } from "@/components/admin/users-table";
import { TriggerScrapeButton } from "@/components/admin/trigger-scrape-button";
import { FetchExposureButton, ScoreAllUsersButton } from "@/components/admin/threat-level-buttons";
import { UsagePanel } from "@/components/admin/usage-panel";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const data = await getAdminPageData();

  return (
    <div className="flex flex-col gap-10 max-w-screen-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
          <p className="text-sm text-gray-400 mt-1">System status, signal pipeline, and user management.</p>
        </div>
        <div className="flex gap-2">
          <FetchExposureButton />
          <ScoreAllUsersButton />
          <TriggerScrapeButton />
        </div>
      </div>

      {/* Top stats */}
      <StatsBar totals={data.totals} />

      {/* API usage */}
      <UsagePanel usage={data.usage} />

      {/* Signal breakdown */}
      <SignalBreakdown
        byCategory={data.signalCountByCategory}
        bySource={data.signalCountBySource}
        byDay={data.signalCountByDay}
      />

      {/* Scraping runs */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Scraping Runs</h2>
        <ScrapingRunsTable runs={data.recentScrapingRuns} />
      </section>

      {/* Users */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Users</h2>
        <UsersTable users={data.users} />
      </section>
    </div>
  );
}
