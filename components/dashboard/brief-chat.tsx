"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; text: string };

const SUGGESTED = [
  "Why is this skill urgent right now?",
  "Which signal is driving my threat score?",
  "What should I do this month?",
];

export function BriefChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function submit(question: string) {
    if (!question.trim() || streaming) return;
    const q = question.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setStreaming(true);

    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

    try {
      const res = await fetch("/api/recommendations/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const chunk = decoder.decode(value);
          setMessages((prev) =>
            prev.map((m, i) =>
              i === assistantIndex ? { ...m, text: m.text + chunk } : m
            )
          );
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === assistantIndex
            ? { ...m, text: "Something went wrong. Try again." }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="rounded-[10px] border border-zinc-800 overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-zinc-800">
        <p className="label">Ask the Brief</p>
        <p className="text-[12px] text-zinc-500 mt-0.5">
          Questions answered from your live macro data
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="p-4 flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="text-[12px] text-zinc-400 border border-zinc-700 rounded-md px-3 py-1.5 hover:border-zinc-500 hover:text-white transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4 max-h-64 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`text-[13px] leading-relaxed ${
                m.role === "user"
                  ? "text-zinc-300 font-medium"
                  : "text-zinc-400"
              }`}
            >
              {m.role === "user" && (
                <span className="text-zinc-600 mr-1.5 text-[11px] font-bold uppercase">You</span>
              )}
              {m.role === "assistant" && (
                <span className="text-blue-400 mr-1.5 text-[11px] font-bold uppercase">
                  Trajectory
                </span>
              )}
              {m.text}
              {m.role === "assistant" && streaming && i === messages.length - 1 && (
                <span className="inline-block w-1 h-3 bg-blue-400 animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit(input)}
          placeholder="Ask a question about your brief…"
          disabled={streaming}
          className="flex-1 bg-transparent text-[13px] text-white placeholder-zinc-600 outline-none disabled:opacity-40"
        />
        <button
          onClick={() => submit(input)}
          disabled={!input.trim() || streaming}
          className="text-[12px] text-zinc-500 hover:text-white disabled:opacity-30 transition-colors shrink-0"
        >
          {streaming ? "…" : "Ask →"}
        </button>
      </div>
    </div>
  );
}
