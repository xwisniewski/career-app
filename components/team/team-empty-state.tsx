import Link from "next/link";

export function TeamEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <p className="text-4xl">👥</p>
      <h2 className="text-lg font-semibold text-gray-900">No team data yet</h2>
      <p className="text-sm text-gray-400 max-w-sm">
        The team view populates once at least one member completes onboarding. Invite your team
        and have them set up their profiles.
      </p>
      <Link href="/dashboard" className="btn-secondary mt-2">
        Back to dashboard
      </Link>
    </div>
  );
}
