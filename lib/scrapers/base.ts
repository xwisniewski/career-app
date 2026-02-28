import type { SignalCategory, Sentiment } from "@/app/generated/prisma/client";

// Raw content pulled from a source before AI categorization
export type RawSignal = {
  source: string;
  sourceUrl: string;
  rawContent: string;
  scrapedAt: Date;
};

// Structured signal ready to write to DB
export type ParsedSignal = {
  source: string;
  sourceUrl: string;
  rawContent: string;
  scrapedAt: Date;
  category: SignalCategory;
  topic: string;
  headline: string;
  dataPoint: string;
  sentiment: Sentiment;
  magnitude: 1 | 2 | 3;
  relevantIndustries: string[];
  relevantRoles: string[];
  relevantSkills: string[];
};

export interface Scraper {
  readonly name: string;
  run(): Promise<RawSignal[]>;
}
