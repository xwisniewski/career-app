import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <AppNav
        user={{
          name: session.user.name,
          email: session.user.email,
          role: session.user.role ?? "USER",
        }}
      />
      <main className="flex-1 ml-[200px] min-h-screen">
        <div className="max-w-screen-xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
