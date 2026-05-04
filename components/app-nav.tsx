"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", key: "F1" },
  { href: "/threat-level", label: "Threat Level", key: "F2" },
  { href: "/recommendations", label: "Recommendations", key: "F3" },
  { href: "/signals", label: "Signals", key: "F4" },
  { href: "/profile", label: "Profile", key: "F5" },
  { href: "/team", label: "Team", key: "F6" },
];

type Props = {
  user: { name?: string | null; email?: string | null; role: string };
};

export function AppNav({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[200px] flex-col border-r border-zinc-900 bg-[#080706]">
      {/* Logo */}
      <div className="border-b border-zinc-900 px-5 py-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[14px] font-semibold leading-tight tracking-tight text-white"
        >
          <span
            className="h-2 w-2"
            style={{ backgroundColor: "rgb(var(--accent))" }}
          />
          Trajectory.io
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV_LINKS.map(({ href, label, key }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-2 px-2.5 py-2 text-[13px] transition-all duration-150 ${
                active
                  ? "text-white font-medium"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              <span
                className={`h-1 w-1 shrink-0 ${
                  active ? "bg-[rgb(var(--accent))]" : "bg-transparent"
                }`}
              />
              <span className="flex-1">{label}</span>
              <span className="mono text-[9px] tracking-[0.1em] text-zinc-700 group-hover:text-zinc-500">
                {key}
              </span>
            </Link>
          );
        })}
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className={`mt-2 flex items-center gap-2 border-t border-zinc-900 px-2.5 py-3 text-[13px] transition-all duration-150 ${
              pathname.startsWith("/admin")
                ? "text-white font-medium"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            <span className="h-1 w-1 shrink-0" />
            <span className="flex-1">Admin</span>
            <span className="mono text-[9px] tracking-[0.1em] text-zinc-700">SYS</span>
          </Link>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-zinc-900 p-4">
        <p className="mono mb-2 text-[10px] uppercase tracking-[0.14em] text-zinc-600">
          Operator
        </p>
        <div className="mb-3 flex items-center gap-2">
          <span className="pulse-dot h-[5px] w-[5px] rounded-full bg-emerald-300" />
          <p className="truncate text-[12px] text-zinc-300">{user.name ?? user.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 transition-colors duration-150 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
