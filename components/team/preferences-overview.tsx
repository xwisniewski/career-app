type Props = {
  preferences: {
    avgRiskTolerance: number | null;
    avgAutonomyVsStatus: number | null;
    avgAmbiguityTolerance: number | null;
    avgHoursPerWeek: number | null;
  };
  avgHoursPerWeek: number | null;
};

function GaugeRow({
  label,
  lowLabel,
  highLabel,
  value,
}: {
  label: string;
  lowLabel: string;
  highLabel: string;
  value: number | null;
}) {
  if (value == null) return null;
  const pct = ((value - 1) / 4) * 100;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{value} / 5</span>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full">
        <div className="bg-gray-900 h-2 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export function PreferencesOverview({ preferences, avgHoursPerWeek }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
      <GaugeRow
        label="Risk tolerance"
        lowLabel="Stable corporate"
        highLabel="Startup / founding"
        value={preferences.avgRiskTolerance}
      />
      <GaugeRow
        label="Autonomy vs. status"
        lowLabel="Prestige-driven"
        highLabel="Autonomy-driven"
        value={preferences.avgAutonomyVsStatus}
      />
      <GaugeRow
        label="Ambiguity tolerance"
        lowLabel="Needs structure"
        highLabel="Thrives in ambiguity"
        value={preferences.avgAmbiguityTolerance}
      />
      {avgHoursPerWeek != null && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">{avgHoursPerWeek} hrs/week</span>
            {" "}average learning capacity across the team
          </p>
        </div>
      )}
    </div>
  );
}
