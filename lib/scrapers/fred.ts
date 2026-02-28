import type { Scraper, RawSignal } from "./base";

// Key FRED series: id → human description
const SERIES: Record<string, string> = {
  PAYEMS: "Total Nonfarm Payrolls (thousands)",
  UNRATE: "Unemployment Rate (%)",
  JTSJOL: "Job Openings: Total Nonfarm (thousands)",
  JTSHIR: "Hires: Total Nonfarm (thousands)",
  JTSQUR: "Quits Rate: Total Nonfarm (%)",
  HOUST: "Housing Starts (thousands, annualized)",
  FEDFUNDS: "Federal Funds Effective Rate (%)",
};

type FredObservation = { date: string; value: string };

async function fetchSeries(id: string, apiKey: string): Promise<FredObservation[]> {
  const url = new URL("https://api.stlouisfed.org/fred/series/observations");
  url.searchParams.set("series_id", id);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", "3"); // last 3 observations to detect change

  const res = await fetch(url.toString(), {
    next: { revalidate: 0 }, // never cache in Next.js
    headers: { "User-Agent": "CareerIntelligenceApp/1.0" },
  });
  if (!res.ok) throw new Error(`FRED API ${res.status} for ${id}`);
  const json = await res.json();
  return json.observations ?? [];
}

export class FredScraper implements Scraper {
  readonly name = "fred_api";

  async run(): Promise<RawSignal[]> {
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) {
      console.warn("[fred] FRED_API_KEY not set — skipping");
      return [];
    }

    const signals: RawSignal[] = [];
    const now = new Date();

    for (const [seriesId, description] of Object.entries(SERIES)) {
      try {
        const obs = await fetchSeries(seriesId, apiKey);
        // Need at least 2 observations to compute change
        const valid = obs.filter((o) => o.value !== "." && o.value !== "");
        if (valid.length < 2) continue;

        const latest = valid[0];
        const prior = valid[1];
        const latestVal = parseFloat(latest.value);
        const priorVal = parseFloat(prior.value);
        const change = latestVal - priorVal;
        const changePct = priorVal !== 0 ? (change / Math.abs(priorVal)) * 100 : 0;

        const direction = change >= 0 ? "increased" : "decreased";
        const absPct = Math.abs(changePct).toFixed(2);
        const absChange = Math.abs(change).toFixed(2);

        const rawContent = [
          `Series: ${seriesId} — ${description}`,
          `Latest (${latest.date}): ${latestVal}`,
          `Prior (${prior.date}): ${priorVal}`,
          `Change: ${direction} by ${absChange} (${absPct}%)`,
        ].join("\n");

        signals.push({
          source: "fred_api",
          sourceUrl: `https://fred.stlouisfed.org/series/${seriesId}`,
          rawContent,
          scrapedAt: now,
        });

        // Avoid rate limiting
        await delay(200);
      } catch (err) {
        console.error(`[fred] Error fetching ${seriesId}:`, err);
      }
    }

    return signals;
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
