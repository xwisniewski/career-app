import type { FullRecommendation } from "@/lib/data/recommendations";

export function PositioningSection({ rec }: { rec: FullRecommendation }) {
  return (
    <section id="positioning" className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Positioning Statement</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          How to describe yourself right now to maximize optionality.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {rec.keyNarrativeToTell}
        </p>
      </div>
    </section>
  );
}
