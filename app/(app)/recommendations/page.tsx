import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRecommendationPageData } from "@/lib/data/recommendations";
import { RecommendationsEmptyState } from "@/components/recommendations/empty-state";
import { SkillsSection } from "@/components/recommendations/skills-section";
import { RolesSection } from "@/components/recommendations/roles-section";
import { IndustrySection } from "@/components/recommendations/industry-section";
import { IncomeSection } from "@/components/recommendations/income-section";
import { PositioningSection } from "@/components/recommendations/positioning-section";
import { RefreshButton } from "@/components/recommendations/refresh-button";

const NAV_SECTIONS = [
  { id: "skills", label: "Skills" },
  { id: "roles", label: "Roles" },
  { id: "industries", label: "Industries" },
  { id: "income", label: "Income" },
  { id: "positioning", label: "Positioning" },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function RecommendationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { recommendation: rec, profile } = await getRecommendationPageData(session.user.id);

  if (!rec || !profile) {
    return <RecommendationsEmptyState />;
  }

  return (
    <div className="flex gap-8 items-start">
      {/* Sticky section nav */}
      <aside className="hidden xl:flex flex-col gap-0.5 w-36 shrink-0 sticky top-20">
        <p className="label mb-3">Sections</p>
        {NAV_SECTIONS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className="text-[13px] text-zinc-500 hover:text-white py-1 transition-all duration-150"
          >
            {label}
          </a>
        ))}
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-16">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-semibold text-white tracking-[-0.03em]">Your Report</h1>
            <p className="text-[14px] text-zinc-400 mt-1.5">
              Generated {timeAgo(rec.generatedAt)}
              {profile.incomeGoal && (
                <> · Income goal:{" "}
                  <span className="font-medium text-zinc-300">
                    ${profile.incomeGoal.toLocaleString()}
                  </span>
                </>
              )}
            </p>
          </div>
          <RefreshButton />
        </div>

        <SkillsSection rec={rec} profile={profile} />
        <RolesSection rec={rec} />
        <IndustrySection rec={rec} />
        <IncomeSection rec={rec} profile={profile} />
        <PositioningSection rec={rec} />
      </div>
    </div>
  );
}
