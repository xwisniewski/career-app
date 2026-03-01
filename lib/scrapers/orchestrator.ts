import "server-only";
import { db } from "@/lib/db";
import { categorizeSignal } from "@/lib/ai/categorize";
import { FredScraper } from "./fred";
import { BlsScraper } from "./bls";
import { HnHiringScraper } from "./hn-hiring";
import { RssScraper } from "./rss";
import type { Scraper, RawSignal } from "./base";
import { ScrapingStatus } from "@/app/generated/prisma/client";

const SCRAPERS: Scraper[] = [
  new FredScraper(),
  new BlsScraper(),
  new HnHiringScraper(),
  new RssScraper(),
];

// Delay between haiku calls to avoid rate limiting
const CATEGORIZE_DELAY_MS = 100;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Check if a signal with the same source + headline already exists
async function isDuplicate(source: string, headline: string): Promise<boolean> {
  const existing = await db.macroSignal.findFirst({
    where: { source, headline },
    select: { id: true },
  });
  return existing !== null;
}

async function runScraper(scraper: Scraper): Promise<{
  signalsFound: number;
  signalsSaved: number;
  errors: string[];
}> {
  let signalsFound = 0;
  let signalsSaved = 0;
  const errors: string[] = [];

  let rawSignals: RawSignal[] = [];

  try {
    rawSignals = await scraper.run();
    signalsFound = rawSignals.length;
  } catch (err) {
    errors.push(`Scraper failed: ${String(err)}`);
    return { signalsFound: 0, signalsSaved: 0, errors };
  }

  for (const raw of rawSignals) {
    try {
      const parsed = await categorizeSignal(raw);
      if (!parsed) {
        errors.push(`Categorization returned null for ${raw.sourceUrl}`);
        continue;
      }

      // Dedup check
      if (await isDuplicate(parsed.source, parsed.headline)) {
        continue;
      }

      await db.macroSignal.create({
        data: {
          source: parsed.source,
          sourceUrl: parsed.sourceUrl,
          rawContent: parsed.rawContent,
          scrapedAt: parsed.scrapedAt,
          category: parsed.category,
          topic: parsed.topic,
          headline: parsed.headline,
          dataPoint: parsed.dataPoint,
          sentiment: parsed.sentiment,
          magnitude: parsed.magnitude,
          relevantIndustries: parsed.relevantIndustries,
          relevantRoles: parsed.relevantRoles,
          relevantSkills: parsed.relevantSkills,
        },
      });

      signalsSaved++;
      await delay(CATEGORIZE_DELAY_MS);
    } catch (err) {
      errors.push(`Failed to save signal from ${raw.sourceUrl}: ${String(err)}`);
    }
  }

  return { signalsFound, signalsSaved, errors };
}

export async function runOrchestrator(): Promise<void> {
  console.log("[orchestrator] Starting scraping run");

  // Clean up any stuck RUNNING records from previous interrupted runs
  await db.scrapingRun.updateMany({
    where: {
      status: ScrapingStatus.RUNNING,
      startedAt: { lt: new Date(Date.now() - 10 * 60 * 1000) }, // older than 10 min
    },
    data: { status: ScrapingStatus.FAILED, errorMessage: "Timed out", completedAt: new Date() },
  });

  // Create run records for all scrapers upfront
  const runs = await Promise.all(
    SCRAPERS.map((scraper) =>
      db.scrapingRun.create({
        data: { scraperName: scraper.name, status: ScrapingStatus.RUNNING, startedAt: new Date() },
      })
    )
  );

  // Run all scrapers in parallel
  const results = await Promise.all(SCRAPERS.map((scraper) => runScraper(scraper)));

  // Update run records
  await Promise.all(
    results.map(async ({ signalsFound, signalsSaved, errors }, i) => {
      const run = runs[i];
      const scraper = SCRAPERS[i];
      const hasErrors = errors.length > 0;
      const status: ScrapingStatus =
        signalsFound === 0 && hasErrors
          ? ScrapingStatus.FAILED
          : hasErrors
          ? ScrapingStatus.PARTIAL
          : ScrapingStatus.SUCCESS;

      await db.scrapingRun.update({
        where: { id: run.id },
        data: {
          status,
          signalsFound,
          signalsSaved,
          errorMessage: errors.length > 0 ? errors.slice(0, 5).join("\n") : null,
          completedAt: new Date(),
        },
      });

      console.log(
        `[orchestrator] ${scraper.name}: ${signalsSaved}/${signalsFound} saved, status=${status}` +
          (errors.length ? `, ${errors.length} errors` : "")
      );
    })
  );

  console.log("[orchestrator] Done");
}
