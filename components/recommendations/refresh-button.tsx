"use client";

import { useState, useTransition } from "react";

export function RefreshButton() {
  const [isPending, startTransition] = useTransition();
  const [queued, setQueued] = useState(false);

  function handleRefresh() {
    startTransition(async () => {
      await fetch("/api/recommendations/refresh", { method: "POST" });
      setQueued(true);
    });
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isPending || queued}
      className="btn-secondary shrink-0 text-xs"
    >
      {isPending ? "Queuing…" : queued ? "Queued ✓" : "↻ Refresh report"}
    </button>
  );
}
