"use client";

import { useState, useTransition } from "react";
import { updatePreferences } from "@/lib/actions/profile";
import { SectionHeader, SaveRow } from "./situation-section";

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

export function PreferencesSection({ initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [riskTolerance, setRiskTolerance] = useState(initial.riskTolerance);
  const [autonomyVsStatus, setAutonomyVsStatus] = useState(initial.autonomyVsStatus);
  const [ambiguityTolerance, setAmbiguityTolerance] = useState(initial.ambiguityTolerance);
  const [geoFlex, setGeoFlex] = useState(initial.geographicFlexibility);
  const [workEnv, setWorkEnv] = useState(initial.workEnvironmentPreference);
  const [familyConstraints, setFamilyConstraints] = useState(initial.familyConstraints);
  const [visaStatus, setVisaStatus] = useState(initial.visaStatus);
  const [entrepreneurial, setEntrepreneurial] = useState(initial.entrepreneurialInterest);
  const [network, setNetwork] = useState<NetworkEntry[]>(initial.networkStrengthByIndustry);
  const [newNetworkIndustry, setNewNetworkIndustry] = useState("");
  const [newNetworkStrength, setNewNetworkStrength] = useState(2);

  function markDirty() { setSaved(false); }

  function addNetwork() {
    if (!newNetworkIndustry.trim()) return;
    setNetwork((prev) => [...prev, { industry: newNetworkIndustry.trim(), strength: newNetworkStrength }]);
    setNewNetworkIndustry("");
    setNewNetworkStrength(2);
    markDirty();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    startTransition(async () => {
      const result = await updatePreferences({
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
      if (result.ok) setSaved(true);
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionHeader title="Preferences" description="How we weight recommendations for your situation." />

      <div className="space-y-5">
        <RatingSlider
          label="Risk tolerance"
          lowLabel="Stable corporate job"
          highLabel="Startup / founding"
          value={riskTolerance}
          onChange={(v) => { setRiskTolerance(v); markDirty(); }}
        />
        <RatingSlider
          label="Autonomy vs. status"
          lowLabel="Prestige-driven"
          highLabel="Autonomy-driven"
          value={autonomyVsStatus}
          onChange={(v) => { setAutonomyVsStatus(v); markDirty(); }}
        />
        <RatingSlider
          label="Ambiguity tolerance"
          lowLabel="Needs structure"
          highLabel="Thrives in ambiguity"
          value={ambiguityTolerance}
          onChange={(v) => { setAmbiguityTolerance(v); markDirty(); }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Geographic flexibility</label>
          <select value={geoFlex} onChange={(e) => { setGeoFlex(e.target.value); markDirty(); }} className="input">
            <option value="LOCAL">Local only</option>
            <option value="NATIONAL">National</option>
            <option value="GLOBAL">Global</option>
            <option value="REMOTE_ONLY">Remote only</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Work environment</label>
          <select value={workEnv} onChange={(e) => { setWorkEnv(e.target.value); markDirty(); }} className="input">
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="IN_PERSON">In-person</option>
            <option value="NO_PREFERENCE">No preference</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visa status</label>
          <select value={visaStatus} onChange={(e) => { setVisaStatus(e.target.value); markDirty(); }} className="input">
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
            onChange={(e) => { setFamilyConstraints(e.target.checked); markDirty(); }}
            className="rounded border-gray-300 text-gray-900"
          />
          <span className="text-sm text-gray-700">Family / relocation constraints</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={entrepreneurial}
            onChange={(e) => { setEntrepreneurial(e.target.checked); markDirty(); }}
            className="rounded border-gray-300 text-gray-900"
          />
          <span className="text-sm text-gray-700">Interested in founding a company</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Network strength by industry</label>
        {network.length > 0 && (
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 mb-2">
            {network.map((n, i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2 text-sm">
                <span>{n.industry}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">Strength {n.strength}/3</span>
                  <button
                    type="button"
                    onClick={() => { setNetwork((prev) => prev.filter((_, idx) => idx !== i)); markDirty(); }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
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
          <select
            value={newNetworkStrength}
            onChange={(e) => setNewNetworkStrength(Number(e.target.value))}
            className="input w-28 text-sm"
          >
            <option value={1}>Weak (1)</option>
            <option value={2}>Medium (2)</option>
            <option value={3}>Strong (3)</option>
          </select>
          <button type="button" onClick={addNetwork} className="btn-secondary text-sm">Add</button>
        </div>
      </div>

      <SaveRow isPending={isPending} saved={saved} error={error} />
    </form>
  );
}
