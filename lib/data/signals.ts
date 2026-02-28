import "server-only";
import { db } from "@/lib/db";

const PAGE_SIZE = 24;

export type SignalDetail = {
  id: string;
  source: string;
  category: string;
  topic: string;
  headline: string;
  dataPoint: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  magnitude: number;
  relevantIndustries: string[];
  relevantRoles: string[];
  relevantSkills: string[];
  scrapedAt: string;
  sourceUrl: string;
  rawContent: string | null;
};

export type SignalsPageResult = {
  signals: SignalDetail[];
  total: number;
  totalPages: number;
  page: number;
  sources: string[];
  trending: SignalDetail[];
};

function toDetail(s: {
  id: string;
  source: string;
  category: string;
  topic: string;
  headline: string;
  dataPoint: string;
  sentiment: string;
  magnitude: number;
  relevantIndustries: string[];
  relevantRoles: string[];
  relevantSkills: string[];
  scrapedAt: Date;
  sourceUrl: string;
  rawContent?: string | null;
}): SignalDetail {
  return {
    id: s.id,
    source: s.source,
    category: s.category,
    topic: s.topic,
    headline: s.headline,
    dataPoint: s.dataPoint,
    sentiment: s.sentiment as SignalDetail["sentiment"],
    magnitude: s.magnitude,
    relevantIndustries: s.relevantIndustries,
    relevantRoles: s.relevantRoles,
    relevantSkills: s.relevantSkills,
    scrapedAt: s.scrapedAt.toISOString(),
    sourceUrl: s.sourceUrl,
    rawContent: s.rawContent ?? null,
  };
}

export async function getSignalsPage(params: {
  q?: string;
  category?: string;
  source?: string;
  sentiment?: string;
  page?: number;
}): Promise<SignalsPageResult> {
  const page = Math.max(1, params.page ?? 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = buildWhere(params);

  const [signals, total, sources, trending] = await Promise.all([
    db.macroSignal.findMany({
      where,
      orderBy: { scrapedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        source: true,
        category: true,
        topic: true,
        headline: true,
        dataPoint: true,
        sentiment: true,
        magnitude: true,
        relevantIndustries: true,
        relevantRoles: true,
        relevantSkills: true,
        scrapedAt: true,
        sourceUrl: true,
      },
    }),
    db.macroSignal.count({ where }),
    db.macroSignal.findMany({
      distinct: ["source"],
      select: { source: true },
      orderBy: { source: "asc" },
    }),
    db.macroSignal.findMany({
      where: { scrapedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      orderBy: [{ magnitude: "desc" }, { scrapedAt: "desc" }],
      take: 6,
      select: {
        id: true,
        source: true,
        category: true,
        topic: true,
        headline: true,
        dataPoint: true,
        sentiment: true,
        magnitude: true,
        relevantIndustries: true,
        relevantRoles: true,
        relevantSkills: true,
        scrapedAt: true,
        sourceUrl: true,
      },
    }),
  ]);

  return {
    signals: signals.map(toDetail),
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    page,
    sources: sources.map((s) => s.source),
    trending: trending.map(toDetail),
  };
}

export async function getSignalById(id: string): Promise<{
  signal: SignalDetail | null;
  related: SignalDetail[];
}> {
  const signal = await db.macroSignal.findUnique({ where: { id } });
  if (!signal) return { signal: null, related: [] };

  const related = await db.macroSignal.findMany({
    where: {
      id: { not: id },
      OR: [
        { category: signal.category },
        { topic: signal.topic },
        { relevantIndustries: { hasSome: signal.relevantIndustries } },
      ],
    },
    orderBy: { scrapedAt: "desc" },
    take: 6,
    select: {
      id: true,
      source: true,
      category: true,
      topic: true,
      headline: true,
      dataPoint: true,
      sentiment: true,
      magnitude: true,
      relevantIndustries: true,
      relevantRoles: true,
      relevantSkills: true,
      scrapedAt: true,
      sourceUrl: true,
    },
  });

  return { signal: toDetail(signal), related: related.map(toDetail) };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildWhere(params: {
  q?: string;
  category?: string;
  source?: string;
  sentiment?: string;
}) {
  type WhereClause = Record<string, unknown>;
  const where: WhereClause = {};

  if (params.q) {
    where.OR = [
      { headline: { contains: params.q, mode: "insensitive" } },
      { dataPoint: { contains: params.q, mode: "insensitive" } },
      { topic: { contains: params.q, mode: "insensitive" } },
      { relevantIndustries: { has: params.q } },
      { relevantSkills: { has: params.q } },
    ];
  }
  if (params.category) where.category = params.category;
  if (params.source) where.source = params.source;
  if (params.sentiment) where.sentiment = params.sentiment;

  return where;
}
