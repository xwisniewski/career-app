import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav
        user={{
          name: session.user.name,
          email: session.user.email,
          role: session.user.role ?? "USER",
        }}
      />
      <div className="max-w-screen-xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
