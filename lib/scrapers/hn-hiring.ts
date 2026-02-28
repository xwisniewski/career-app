import type { Scraper, RawSignal } from "./base";

type AlgoliaHit = {
  objectID: string;
  title: string;
  url: string;
  author: string;
  created_at: string;
  points: number;
};

type HNComment = {
  objectID: string;
  text: string;
  author: string;
  created_at: string;
  points: number;
};

// Find the latest "Ask HN: Who is Hiring?" thread via Algolia
async function getLatestHiringThreadId(): Promise<string | null> {
  const url = "https://hn.algolia.com/api/v1/search?query=Ask+HN%3A+Who+is+hiring&tags=story&numericFilters=author%3Dwhoishiring&hitsPerPage=1";
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return null;
  const json = await res.json();
  const hit: AlgoliaHit | undefined = json.hits?.[0];
  return hit?.objectID ?? null;
}

// Fetch top comments from the thread (job postings)
async function getTopComments(threadId: string, limit = 30): Promise<HNComment[]> {
  const url = `https://hn.algolia.com/api/v1/search?tags=comment,story_${threadId}&hitsPerPage=${limit}&numericFilters=points>1`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const json = await res.json();
  return json.hits ?? [];
}

// Strip HTML tags from HN comment text
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export class HnHiringScraper implements Scraper {
  readonly name = "hn_hiring";

  async run(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];

    try {
      const threadId = await getLatestHiringThreadId();
      if (!threadId) {
        console.warn("[hn_hiring] Could not find latest hiring thread");
        return [];
      }

      const comments = await getTopComments(threadId, 40);
      const now = new Date();

      for (const comment of comments) {
        if (!comment.text) continue;
        const text = stripHtml(comment.text);
        if (text.length < 50) continue; // skip very short comments

        // Aggregate similar comments into batches of 5 for haiku efficiency
        signals.push({
          source: "hn_hiring",
          sourceUrl: `https://news.ycombinator.com/item?id=${comment.objectID}`,
          rawContent: `HN Who's Hiring — Job Posting\n\n${text.slice(0, 1500)}`,
          scrapedAt: now,
        });
      }

      // Also create an aggregate signal summarizing the thread
      if (comments.length > 0) {
        const sample = comments
          .slice(0, 10)
          .map((c) => stripHtml(c.text).slice(0, 200))
          .join("\n---\n");

        signals.push({
          source: "hn_hiring",
          sourceUrl: `https://news.ycombinator.com/item?id=${threadId}`,
          rawContent: `HN Ask HN: Who Is Hiring? — Thread Summary (${comments.length} postings)\n\nSample postings:\n${sample}`,
          scrapedAt: now,
        });
      }
    } catch (err) {
      console.error("[hn_hiring] Error:", err);
    }

    return signals;
  }
}
