type Props = {
  action: string;
  scoreReduction?: number;
};

/** The single opinionated action card — the most prominent CTA on the detail page. */
export function RecommendedAction({ action, scoreReduction }: Props) {
  return (
    <div className="bg-zinc-900 border border-amber-900/50 rounded-lg p-5">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <div className="w-8 h-8 rounded-md bg-amber-950/60 border border-amber-800/50 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest">
              Recommended Action
            </span>
            {scoreReduction !== undefined && (
              <span className="text-[10px] bg-green-950/60 text-green-400 border border-green-900/40 rounded px-1.5 py-0.5 font-medium">
                −{scoreReduction} pts if done
              </span>
            )}
          </div>
          <p className="text-[14px] font-semibold text-white leading-snug">{action}</p>
        </div>
      </div>
    </div>
  );
}
