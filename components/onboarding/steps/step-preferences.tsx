"use client";

import { useState, useTransition } from "react";
import { saveStep4 } from "@/lib/actions/onboarding";

type NetworkEntry = { industry: string; strength: number };

type Props = {
  initial: {
    riskTolerance: number;
    autonomyVsStatus: number;
    ambiguityTolerance: number;
    geographicFlexibility: string;
    workEnvironmentPreference: string;
    familyConstraints: boolean;
    visaStatus: string;
    entrepreneurialInterest: boolean;
    networkStrengthByIndustry: NetworkEntry[];
  };
  onNext: () => void;
  onBack: () => void;
};

function RatingSlider({
  label,
  lowLabel,
  highLabel,
  value,
  onChange,
}: {
  label: string;
  lowLabel: string;
  highLabel: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500">{value} / 5</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-gray-900"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export function StepPreferences({ initial, onNext, onBack }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [riskTolerance, setRiskTolerance] = useState(initial.riskTolerance ?? 3);
  const [autonomyVsStatus, setAutonomyVsStatus] = useState(initial.autonomyVsStatus ?? 3);
  const [ambiguityTolerance, setAmbiguityTolerance] = useState(initial.ambiguityTolerance ?? 3);
  const [geoFlex, setGeoFlex] = useState(initial.geographicFlexibility ?? "NATIONAL");
  const [workEnv, setWorkEnv] = useState(initial.workEnvironmentPreference ?? "NO_PREFERENCE");
  const [familyConstraints, setFamilyConstraints] = useState(initial.familyConstraints ?? false);
  const [visaStatus, setVisaStatus] = useState(initial.visaStatus ?? "CITIZEN");
  const [entrepreneurial, setEntrepreneurial] = useState(initial.entrepreneurialInterest ?? false);
  const [network, setNetwork] = useState<NetworkEntry[]>(initial.networkStrengthByIndustry ?? []);
  const [newNetworkIndustry, setNewNetworkIndustry] = useState("");
  const [newNetworkStrength, setNewNetworkStrength] = useState(2);

  function addNetwork() {
    if (!newNetworkIndustry.trim()) return;
    setNetwork((prev) => [...prev, { industry: newNetworkIndustry.trim(), strength: newNetworkStrength }]);
    setNewNetworkIndustry("");
    setNewNetworkStrength(2);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await saveStep4({
        riskTolerance,
        autonomyVsStatus,
        ambiguityTolerance,
        geographicFlexibility: geoFlex,
        workEnvironmentPreference: workEnv,
        familyConstraints,
        visaStatus,
        entrepreneurialInterest: entrepreneurial,
        networkStrengthByIndustry: network,
      });
      if (result.ok) onNext();
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Your preferences</h2>
        <p className="mt-1 text-sm text-gray-500">These shape how we weight recommendations for you.</p>
      </div>

      <div className="space-y-5">
        <RatingSlider
          label="Risk tolerance"
          lowLabel="Stable corporate job"
          highLabel="Startup / founding"
          value={riskTolerance}
          onChange={setRiskTolerance}
        />
        <RatingSlider
          label="Autonomy vs. status"
          lowLabel="Prestige-driven"
          highLabel="Autonomy-driven"
          value={autonomyVsStatus}
          onChange={setAutonomyVsStatus}
        />
        <RatingSlider
          label="Ambiguity tolerance"
          lowLabel="Needs structure"
          highLabel="Thrives in ambiguity"
          value={ambiguityTolerance}
          onChange={setAmbiguityTolerance}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Geographic flexibility</label>
          <select value={geoFlex} onChange={(e) => setGeoFlex(e.target.value)} className="input">
            <option value="LOCAL">Local only</option>
            <option value="NATIONAL">National</option>
            <option value="GLOBAL">Global</option>
            <option value="REMOTE_ONLY">Remote only</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Work environment</label>
          <select value={workEnv} onChange={(e) => setWorkEnv(e.target.value)} className="input">
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="IN_PERSON">In-person</option>
            <option value="NO_PREFERENCE">No preference</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visa status</label>
          <select value={visaStatus} onChange={(e) => setVisaStatus(e.target.value)} className="input">
            <option value="CITIZEN">Citizen</option>
            <option value="PERMANENT_RESIDENT">Permanent resident</option>
            <option value="WORK_VISA">Work visa</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={familyConstraints}
            onChange={(e) => setFamilyConstraints(e.target.checked)}
            className="rounded border-gray-300 text-gray-900"
          />
          <span className="text-sm text-gray-700">Family / relocation constraints</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={entrepreneurial}
            onChange={(e) => setEntrepreneurial(e.target.checked)}
            className="rounded border-gray-300 text-gray-900"
          />
          <span className="text-sm text-gray-700">Interested in founding a company</span>
        </label>
      </div>

      {/* Network strength */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Network strength by industry</label>
        {network.length > 0 && (
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 mb-2">
            {network.map((n, i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2 text-sm">
                <span>{n.industry}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">Strength {n.strength}/3</span>
                  <button type="button" onClick={() => setNetwork((prev) => prev.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">×</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newNetworkIndustry}
            onChange={(e) => setNewNetworkIndustry(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNetwork(); } }}
            placeholder="Industry"
            className="input flex-1 text-sm"
          />
          <select value={newNetworkStrength} onChange={(e) => setNewNetworkStrength(Number(e.target.value))} className="input w-28 text-sm">
            <option value={1}>Weak (1)</option>
            <option value={2}>Medium (2)</option>
            <option value={3}>Strong (3)</option>
          </select>
          <button type="button" onClick={addNetwork} className="btn-secondary text-sm">Add</button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="btn-ghost">← Back</button>
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Saving…" : "Continue →"}
        </button>
      </div>
    </form>
  );
}
