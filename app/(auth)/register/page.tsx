"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      router.push("/login");
    } else {
      router.push("/onboarding");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[28px] font-semibold text-white tracking-[-0.02em] mb-1">
          Create account
        </h1>
        <p className="text-[15px] text-zinc-500">Career Intelligence</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-[13px] font-medium text-zinc-400">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="input"
            placeholder="Your name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] font-medium text-zinc-400">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[13px] font-medium text-zinc-400">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="input"
            placeholder="Min 8 characters"
          />
        </div>

        {error && (
          <p className="text-[13px] text-red-600">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-[14px] text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="text-white font-medium hover:underline transition-all duration-150">
          Sign in
        </Link>
      </p>
    </div>
  );
}
