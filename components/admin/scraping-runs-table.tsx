type Run = {
  id: string;
  scraperName: string;
  status: string;
  signalsFound: number;
  signalsSaved: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  RUNNING: "bg-yellow-100 text-yellow-700",
  PARTIAL: "bg-orange-100 text-orange-700",
};

function duration(start: string, end: string | null) {
  if (!end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ScrapingRunsTable({ runs }: { runs: Run[] }) {
  if (runs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
        No scraping runs yet. Click &ldquo;Run scrape now&rdquo; to start.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left px-4 py-3">Scraper</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-right px-4 py-3">Found</th>
            <th className="text-right px-4 py-3">Saved</th>
            <th className="text-right px-4 py-3">Duration</th>
            <th className="text-right px-4 py-3">Started</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {runs.map((run) => (
            <tr key={run.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{run.scraperName}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_STYLES[run.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {run.status}
                </span>
                {run.errorMessage && (
                  <p className="text-xs text-red-500 mt-0.5 max-w-xs truncate" title={run.errorMessage}>
                    {run.errorMessage}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-right text-gray-600">{run.signalsFound}</td>
              <td className="px-4 py-3 text-right text-gray-600">{run.signalsSaved}</td>
              <td className="px-4 py-3 text-right text-gray-500">{duration(run.startedAt, run.completedAt)}</td>
              <td className="px-4 py-3 text-right text-gray-400">{timeAgo(run.startedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
