import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { TickerStrip } from "@/components/ticker-strip";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[#080706]">
      <AppNav
        user={{
          name: session.user.name,
          email: session.user.email,
          role: session.user.role ?? "USER",
        }}
      />
      <div className="ml-[200px] flex min-h-screen min-w-0 flex-1 flex-col">
        <TickerStrip />
        <main className="min-w-0 flex-1">
          <div className="w-full max-w-[1720px] px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
