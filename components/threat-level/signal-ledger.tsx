import type { SignalDriver } from "@/lib/threat-level/types";

type Props = {
  drivers: SignalDriver[];
};

const CATEGORY_LABELS: Record<string, string> = {
  JOB_MARKET: "Job Market",
  CAPITAL_FLOWS: "Capital",
  SKILL_DEMAND: "Skill Demand",
  DISPLACEMENT_RISK: "Displacement",
  POLICY: "Policy",
  OCCUPATION_EXPOSURE: "Occupation",
};

export function SignalLedger({ drivers }: Props) {
  if (drivers.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-[13px] font-semibold text-white mb-3">Signal Ledger</h3>
        <p className="text-[12px] text-zinc-500">
          No signal data yet. Scrape run needed to populate threat drivers.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <h3 className="text-[13px] font-semibold text-white mb-4">
        Signal Ledger
        <span className="ml-2 text-[11px] font-normal text-zinc-500">
          — signals pushing your score up
        </span>
      </h3>
      <div className="space-y-3">
        {drivers.map((driver) => (
          <div
            key={driver.signalId}
            className="flex gap-3 pb-3 border-b border-zinc-800 last:border-0 last:pb-0"
          >
            {/* Contribution badge */}
            <div className="shrink-0 w-10 h-10 rounded-md bg-red-950/40 border border-red-900/40 flex items-center justify-center">
              <span className="text-[12px] font-bold text-red-400">+{driver.contribution}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                  {CATEGORY_LABELS[driver.category] ?? driver.category}
                </span>
              </div>
              <p className="text-[12px] font-medium text-zinc-200 leading-snug truncate">
                {driver.headline}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                {driver.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
