import "server-only";
import { db } from "@/lib/db";

export async function getAdminPageData() {
  const [
    signalCountByCategory,
    signalCountBySource,
    signalCountByDay,
    recentScrapingRuns,
    users,
    totalSignals,
    totalRecs,
    tokenUsage,
  ] = await Promise.all([
    // Signals by category
    db.macroSignal.groupBy({
      by: ["category"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),

    // Signals by source
    db.macroSignal.groupBy({
      by: ["source"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),

    // Signals per day (last 14 days)
    db.$queryRaw<{ day: string; count: number }[]>`
      SELECT
        DATE_TRUNC('day', "scrapedAt")::date::text AS day,
        COUNT(*)::int AS count
      FROM "MacroSignal"
      WHERE "scrapedAt" >= NOW() - INTERVAL '14 days'
      GROUP BY 1
      ORDER BY 1
    `,

    // Last 20 scraping runs
    db.scrapingRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
    }),

    // All users with profile + latest rec
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            currentRole: true,
            currentIndustry: true,
            onboardingComplete: true,
          },
        },
        recommendations: {
          where: { isLatest: true },
          select: { generatedAt: true },
          take: 1,
        },
      },
    }),

    db.macroSignal.count(),
    db.careerRecommendation.count(),

    // Token usage aggregates
    db.careerRecommendation.aggregate({
      _sum: { inputTokens: true, outputTokens: true },
      _avg: { inputTokens: true, outputTokens: true },
      _count: { inputTokens: true },
    }),
  ]);

  return {
    signalCountByCategory: signalCountByCategory.map((r) => ({
      category: r.category,
      count: r._count.id,
    })),
    signalCountBySource: signalCountBySource.map((r) => ({
      source: r.source,
      count: r._count.id,
    })),
    signalCountByDay,
    recentScrapingRuns: recentScrapingRuns.map((r) => ({
      id: r.id,
      scraperName: r.scraperName,
      status: r.status,
      signalsFound: r.signalsFound,
      signalsSaved: r.signalsSaved,
      errorMessage: r.errorMessage,
      startedAt: r.startedAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
    })),
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      currentRole: u.profile?.currentRole ?? null,
      currentIndustry: u.profile?.currentIndustry ?? null,
      onboardingComplete: u.profile?.onboardingComplete ?? false,
      lastReportAt: u.recommendations[0]?.generatedAt.toISOString() ?? null,
    })),
    totals: {
      signals: totalSignals,
      recommendations: totalRecs,
      users: users.length,
    },
    usage: {
      totalInputTokens: tokenUsage._sum.inputTokens ?? 0,
      totalOutputTokens: tokenUsage._sum.outputTokens ?? 0,
      avgInputTokens: Math.round(tokenUsage._avg.inputTokens ?? 0),
      avgOutputTokens: Math.round(tokenUsage._avg.outputTokens ?? 0),
      trackedRecs: tokenUsage._count.inputTokens,
      // claude-sonnet-4-6 pricing: $3/MTok input, $15/MTok output
      estimatedCostUsd:
        ((tokenUsage._sum.inputTokens ?? 0) * 3 +
          (tokenUsage._sum.outputTokens ?? 0) * 15) /
        1_000_000,
    },
  };
}

export type AdminPageData = Awaited<ReturnType<typeof getAdminPageData>>;
