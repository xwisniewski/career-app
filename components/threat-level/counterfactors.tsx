import type { Counterfactor } from "@/lib/threat-level/types";

type Props = {
  counterfactors: Counterfactor[];
};

export function Counterfactors({ counterfactors }: Props) {
  if (counterfactors.length === 0) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <h3 className="text-[13px] font-semibold text-white mb-4">
        Counterfactors
        <span className="ml-2 text-[11px] font-normal text-zinc-500">
          — signals reducing your risk
        </span>
      </h3>
      <div className="space-y-3">
        {counterfactors.map((cf) => (
          <div
            key={cf.signalId}
            className="flex gap-3 pb-3 border-b border-zinc-800 last:border-0 last:pb-0"
          >
            {/* Offset badge */}
            <div className="shrink-0 w-10 h-10 rounded-md bg-green-950/40 border border-green-900/40 flex items-center justify-center">
              <span className="text-[12px] font-bold text-green-400">−{cf.pointsOffset}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-zinc-200 leading-snug truncate">
                {cf.headline}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                {cf.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
