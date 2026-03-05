"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/signals", label: "Signals" },
  { href: "/profile", label: "Profile" },
  { href: "/team", label: "Team" },
];

type Props = {
  user: { name?: string | null; email?: string | null; role: string };
};

export function AppNav({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] fixed top-0 left-0 h-screen bg-zinc-950 border-r border-zinc-800/60 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800/60">
        <Link
          href="/dashboard"
          className="text-[14px] font-semibold text-white tracking-tight leading-tight"
        >
          Career<br />Intelligence
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-md text-[13px] transition-all duration-150 ${
                active
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              {label}
            </Link>
          );
        })}
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className={`px-3 py-2 rounded-md text-[13px] transition-all duration-150 ${
              pathname.startsWith("/admin")
                ? "bg-zinc-800 text-white font-medium"
                : "text-zinc-500 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            Admin
          </Link>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-zinc-800/60">
        <p className="text-[12px] text-zinc-500 truncate mb-2">
          {user.name ?? user.email}
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-[12px] text-zinc-600 hover:text-white transition-colors duration-150"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
