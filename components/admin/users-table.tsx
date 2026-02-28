"use client";

import { useState, useTransition } from "react";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  currentRole: string | null;
  currentIndustry: string | null;
  onboardingComplete: boolean;
  lastReportAt: string | null;
};

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function RegenButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  function handleRegen() {
    startTransition(async () => {
      const res = await fetch("/api/admin/regen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setStatus(res.ok ? "done" : "error");
    });
  }

  if (status === "done") return <span className="text-xs text-green-600">Generated ✓</span>;
  if (status === "error") return <span className="text-xs text-red-500">Failed</span>;

  return (
    <button
      onClick={handleRegen}
      disabled={isPending}
      className="text-xs text-gray-500 hover:text-gray-900 underline disabled:opacity-50 transition-colors"
    >
      {isPending ? "Generating…" : "Regen report"}
    </button>
  );
}

export function UsersTable({ users }: { users: User[] }) {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
        No users yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left px-4 py-3">User</th>
            <th className="text-left px-4 py-3">Role / Industry</th>
            <th className="text-center px-4 py-3">Onboarded</th>
            <th className="text-right px-4 py-3">Last report</th>
            <th className="text-right px-4 py-3">Joined</th>
            <th className="text-right px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-800">{user.name ?? "—"}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
                {user.role === "ADMIN" && (
                  <span className="text-xs bg-gray-900 text-white px-1.5 py-0.5 rounded">admin</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {user.currentRole && <p>{user.currentRole}</p>}
                {user.currentIndustry && <p className="text-xs text-gray-400">{user.currentIndustry}</p>}
                {!user.currentRole && <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3 text-center">
                {user.onboardingComplete ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right text-gray-500">{timeAgo(user.lastReportAt)}</td>
              <td className="px-4 py-3 text-right text-gray-400">{timeAgo(user.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                {user.onboardingComplete && <RegenButton userId={user.id} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
