import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-[560px] w-full text-center flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest">
            Trajectory.io
          </p>
          <h1 className="text-[40px] font-semibold text-white tracking-[-0.03em] leading-[1.15]">
            Macro-grounded guidance,<br />personalized to you.
          </h1>
          <p className="text-[17px] text-zinc-500 leading-relaxed max-w-[440px]">
            Cross-reference real-time economic signals with your career profile
            to get AI-powered, opinionated advice.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary">
            Get started
          </Link>
        </div>

        <div className="flex items-center gap-6 pt-4 border-t border-zinc-800 w-full justify-center">
          {["Job Market", "Capital Flows", "Skill Demand", "Policy"].map((label) => (
            <span key={label} className="text-[12px] text-zinc-400">
              {label}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
