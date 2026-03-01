import { Suspense } from "react";
import { getSignalsPage } from "@/lib/data/signals";
import { SignalFilters } from "@/components/signals/signal-filters";
import { TrendingStrip } from "@/components/signals/trending-strip";
import { SignalsGrid } from "@/components/signals/signals-grid";

type SearchParams = Promise<{ q?: string; category?: string; source?: string; sentiment?: string; page?: string }>;

export default async function SignalsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const { signals, total, totalPages, sources, trending } = await getSignalsPage({
    q: params.q,
    category: params.category,
    source: params.source,
    sentiment: params.sentiment,
    page,
  }).catch((err) => {
    console.error("[signals page] getSignalsPage failed:", err);
    throw err;
  });

  return (
    <div className="flex gap-6 items-start">
      {/* Filters sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 sticky top-20">
        <Suspense>
          <SignalFilters sources={sources} />
        </Suspense>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-gray-900">Signal Explorer</h1>
          <p className="text-sm text-gray-400 mt-0.5">All scraped macro signals, unfiltered</p>
        </div>

        {/* Trending strip — only on unfiltered view */}
        {!params.q && !params.category && !params.source && !params.sentiment && (
          <TrendingStrip signals={trending} />
        )}

        {/* Mobile filters (inline) */}
        <div className="lg:hidden mb-4">
          <Suspense>
            <SignalFilters sources={sources} />
          </Suspense>
        </div>

        <SignalsGrid signals={signals} total={total} page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
