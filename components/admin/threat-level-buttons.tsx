"use client";

import { useState, useTransition } from "react";

export function FetchExposureButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      const res = await fetch("/api/threat-level/fetch-exposure", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      setResult(
        res.ok
          ? `Done — ${data.upserted ?? "?"} occupations upserted`
          : `Failed: ${data.error ?? "unknown error"}`
      );
      setTimeout(() => setResult(null), 8000);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="btn-primary shrink-0"
    >
      {isPending ? "Fetching…" : result ?? "↻ Fetch exposure data"}
    </button>
  );
}

export function ScoreAllUsersButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      const res = await fetch("/api/threat-level/score", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      setResult(
        res.ok
          ? `Done — ${data.processed ?? "?"}/${data.total ?? "?"} users scored`
          : `Failed: ${data.error ?? "unknown error"}`
      );
      setTimeout(() => setResult(null), 8000);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="btn-primary shrink-0"
    >
      {isPending ? "Scoring…" : result ?? "↻ Score all users"}
    </button>
  );
}
