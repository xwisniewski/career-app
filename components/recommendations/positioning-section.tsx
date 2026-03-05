import type { FullRecommendation } from "@/lib/data/recommendations";

export function PositioningSection({ rec }: { rec: FullRecommendation }) {
  return (
    <section id="positioning" className="flex flex-col gap-6">
      <div className="section-header">
        <h2 className="text-[20px] font-semibold text-white tracking-[-0.02em]">Positioning Statement</h2>
        <p className="text-[14px] text-zinc-500">
          How to describe yourself right now to maximize optionality.
        </p>
      </div>

      <div className="rounded-[10px] border border-zinc-800 p-6">
        <p className="text-[15px] text-zinc-300 leading-relaxed whitespace-pre-line">
          {rec.keyNarrativeToTell}
        </p>
      </div>
    </section>
  );
}
