import type { Scraper, RawSignal } from "./base";

// BLS series IDs and their descriptions
// https://www.bls.gov/help/hlpforma.htm
const SERIES: { id: string; description: string; unit: string }[] = [
  { id: "CES0000000001", description: "Total nonfarm employment", unit: "thousands of jobs" },
  { id: "LNS14000000", description: "Unemployment rate", unit: "%" },
  { id: "CES6500000001", description: "Healthcare and social assistance employment", unit: "thousands" },
  { id: "CES5000000001", description: "Information sector employment", unit: "thousands" },
  { id: "CES5500000001", description: "Financial activities employment", unit: "thousands" },
  { id: "CUUR0000SA0", description: "Consumer Price Index (CPI-U)", unit: "index" },
];

type BlsObservation = { year: string; period: string; value: string };

async function fetchSeriesBatch(seriesIds: string[]): Promise<Record<string, BlsObservation[]>> {
  const res = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      seriesid: seriesIds,
      startyear: String(new Date().getFullYear() - 1),
      endyear: String(new Date().getFullYear()),
      calculations: true,
    }),
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`BLS API ${res.status}`);
  const json = await res.json();
  if (json.status !== "REQUEST_SUCCEEDED") {
    throw new Error(`BLS API error: ${json.message?.join(", ")}`);
  }

  const result: Record<string, BlsObservation[]> = {};
  for (const series of json.Results?.series ?? []) {
    result[series.seriesID] = series.data ?? [];
  }
  return result;
}

export class BlsScraper implements Scraper {
  readonly name = "bls_api";

  async run(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];
    const now = new Date();

    try {
      const seriesIds = SERIES.map((s) => s.id);
      const data = await fetchSeriesBatch(seriesIds);

      for (const meta of SERIES) {
        const obs = data[meta.id] ?? [];
        // BLS returns newest first
        const valid = obs.filter((o) => o.value !== "-");
        if (valid.length < 2) continue;

        const latest = valid[0];
        const prior = valid[1];
        const latestVal = parseFloat(latest.value);
        const priorVal = parseFloat(prior.value);
        const change = latestVal - priorVal;
        const changePct = priorVal !== 0 ? (change / Math.abs(priorVal)) * 100 : 0;
        const direction = change >= 0 ? "increased" : "decreased";

        const periodLabel = (o: BlsObservation) =>
          `${o.year} ${o.period.replace("M", "Month ")}`;

        const rawContent = [
          `BLS Series: ${meta.id} — ${meta.description}`,
          `Latest (${periodLabel(latest)}): ${latestVal} ${meta.unit}`,
          `Prior (${periodLabel(prior)}): ${priorVal} ${meta.unit}`,
          `Change: ${direction} by ${Math.abs(change).toFixed(1)} ${meta.unit} (${Math.abs(changePct).toFixed(2)}%)`,
        ].join("\n");

        signals.push({
          source: "bls_api",
          sourceUrl: `https://www.bls.gov/data/#seriesid=${meta.id}`,
          rawContent,
          scrapedAt: now,
        });
      }
    } catch (err) {
      console.error("[bls] Error:", err);
    }

    return signals;
  }
}
