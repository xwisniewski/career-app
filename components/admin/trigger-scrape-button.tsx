"use client";

import { useState, useTransition } from "react";

export function TriggerScrapeButton() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "queued" | "error">("idle");

  function handleClick() {
    startTransition(async () => {
      const res = await fetch("/api/scrape/run", { method: "POST" });
      setStatus(res.ok ? "queued" : "error");
      // Reset after 5s so button is usable again
      setTimeout(() => setStatus("idle"), 5000);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || status === "queued"}
      className="btn-primary shrink-0"
    >
      {isPending
        ? "Triggering…"
        : status === "queued"
        ? "Queued ✓"
        : status === "error"
        ? "Failed — retry"
        : "↻ Run scrape now"}
    </button>
  );
}
