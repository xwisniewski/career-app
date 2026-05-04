"use client";

import { useState, useTransition } from "react";

export function RegenButton() {
  const [isPending, startTransition] = useTransition();
  const [queued, setQueued] = useState(false);

  function handleClick() {
    startTransition(async () => {
      await fetch("/api/recommendations/refresh", { method: "POST" });
      setQueued(true);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || queued}
      className="border border-sky-500/40 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-accent transition-colors hover:bg-sky-500/10 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600"
    >
      {isPending ? "Regen…" : queued ? "Queued" : "Regen ⟳"}
    </button>
  );
}
