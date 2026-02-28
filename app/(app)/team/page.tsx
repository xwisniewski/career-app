import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTeamPageData } from "@/lib/data/team";
import { TeamEmptyState } from "@/components/team/team-empty-state";
import { SkillsLandscape } from "@/components/team/skills-landscape";
import { FrequencyChart } from "@/components/team/frequency-chart";
import { DistributionChart } from "@/components/team/distribution-chart";
import { PreferencesOverview } from "@/components/team/preferences-overview";

export default async function TeamPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const data = await getTeamPageData();

  if (!data) return <TeamEmptyState />;

  const WORK_ENV_LABELS: Record<string, string> = {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    IN_PERSON: "In-person",
    NO_PREFERENCE: "No preference",
  };
  const LEARN_LABELS: Record<string, string> = {
    COURSES: "Courses",
    PROJECTS: "Projects",
    MENTORSHIP: "Mentorship",
    READING: "Reading",
    MIXED: "Mixed",
  };

  return (
    <div className="flex flex-col gap-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team View</h1>
        <p className="text-sm text-gray-400 mt-1">
          Aggregated across {data.memberCount} team member{data.memberCount !== 1 ? "s" : ""}.
          All data is anonymized.
        </p>
      </div>

      {/* Skills landscape */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Skills Landscape" description="Most common skills and average proficiency across the team." />
        <SkillsLandscape skills={data.topSkills} memberCount={data.memberCount} />
      </section>

      {/* Roles + Industries side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="flex flex-col gap-3">
          <SectionHeader title="Target Roles" description="Where the team wants to go." />
          <FrequencyChart
            items={data.topRoles.map((r) => ({ label: r.role, count: r.count }))}
            max={data.memberCount}
            emptyMessage="No target roles set yet."
          />
        </section>
        <section className="flex flex-col gap-3">
          <SectionHeader title="Industries" description="Current and target industries." />
          <FrequencyChart
            items={data.topIndustries.map((r) => ({ label: r.industry, count: r.count }))}
            max={data.memberCount}
            emptyMessage="No industry data yet."
          />
        </section>
      </div>

      {/* Experience + Income distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="flex flex-col gap-3">
          <SectionHeader title="Experience" description="Years of experience distribution." />
          <DistributionChart buckets={data.expBuckets} />
        </section>
        <section className="flex flex-col gap-3">
          <SectionHeader title="Income Goals" description="Anonymized income target ranges." />
          <DistributionChart buckets={data.incomeBuckets} />
        </section>
      </div>

      {/* Preferences */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Team Preferences" description="Average scores on key dimensions." />
        <PreferencesOverview preferences={data.preferences} avgHoursPerWeek={data.preferences.avgHoursPerWeek} />
      </section>

      {/* Work env + Learning style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="flex flex-col gap-3">
          <SectionHeader title="Work Environment" description="Preferred work setup." />
          <FrequencyChart
            items={data.workEnvBreakdown.map((r) => ({ label: WORK_ENV_LABELS[r.env] ?? r.env, count: r.count }))}
            max={data.memberCount}
            emptyMessage="No preferences set."
          />
        </section>
        <section className="flex flex-col gap-3">
          <SectionHeader title="Learning Style" description="How the team prefers to upskill." />
          <FrequencyChart
            items={data.learningStyles.map((r) => ({ label: LEARN_LABELS[r.style] ?? r.style, count: r.count }))}
            max={data.memberCount}
            emptyMessage="No learning style data."
          />
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
