import Parser from "rss-parser";
import type { Scraper, RawSignal } from "./base";

// Configurable RSS feeds — all high signal, no scraping complexity
const FEEDS: { name: string; url: string; source: string }[] = [
  {
    name: "TechCrunch Layoffs",
    url: "https://techcrunch.com/tag/layoffs/feed/",
    source: "techcrunch_layoffs",
  },
  {
    name: "TechCrunch Startups",
    url: "https://techcrunch.com/category/startups/feed/",
    source: "techcrunch_startups",
  },
  {
    name: "Hacker News Best",
    url: "https://hnrss.org/best?points=100",
    source: "hn_best",
  },
  {
    name: "MIT Tech Review AI",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
    source: "mit_tech_review",
  },
];

const parser = new Parser({
  timeout: 10_000,
  headers: { "User-Agent": "CareerIntelligenceApp/1.0 (RSS reader)" },
});

export class RssScraper implements Scraper {
  readonly name = "rss_feeds";

  async run(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];
    const now = new Date();
    const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000); // last 48 hours

    for (const feed of FEEDS) {
      try {
        const result = await parser.parseURL(feed.url);

        for (const item of result.items ?? []) {
          const pubDate = item.pubDate ? new Date(item.pubDate) : null;
          // Only include recent items
          if (pubDate && pubDate < cutoff) continue;

          const title = item.title ?? "";
          const summary = item.contentSnippet ?? item.content ?? "";
          if (!title && !summary) continue;

          const rawContent = [
            `Source: ${feed.name}`,
            `Title: ${title}`,
            `Published: ${item.pubDate ?? "unknown"}`,
            `Summary: ${summary.slice(0, 800)}`,
          ].join("\n");

          signals.push({
            source: feed.source,
            sourceUrl: item.link ?? feed.url,
            rawContent,
            scrapedAt: now,
          });
        }
      } catch (err) {
        console.error(`[rss] Error fetching ${feed.name}:`, err);
      }
    }

    return signals;
  }
}
