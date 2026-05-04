import type { SignalNotificationRow } from "@/lib/data/notifications";

const SEVERITY_STYLES = {
  INFO: "border-zinc-700 bg-zinc-800/60 text-zinc-300",
  WATCH: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  IMPORTANT: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  URGENT: "border-red-500/30 bg-red-500/10 text-red-300",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function SignalAlerts({ notifications }: { notifications: SignalNotificationRow[] }) {
  if (notifications.length === 0) return null;

  return (
    <div
      className="rounded-[10px] border p-4"
      style={{
        borderColor: "rgb(var(--accent-line))",
        backgroundColor: "rgb(var(--accent-soft))",
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ backgroundColor: "rgb(var(--accent))" }}
          />
          <p
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "rgb(var(--accent))" }}
          >
            Signal alerts · new
          </p>
        </div>
        <span
          className="font-mono text-[10px] num tracking-wider"
          style={{ color: "rgb(var(--accent))" }}
        >
          {notifications.length}
        </span>
      </div>

      <div className="space-y-2">
        {notifications.slice(0, 3).map((notification) => (
          <a
            key={notification.id}
            href={notification.signal.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span
                className={`rounded-full border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${SEVERITY_STYLES[notification.severity]}`}
              >
                {notification.severity}
              </span>
              <span className="font-mono text-[10px] tracking-wider text-zinc-600">
                {timeAgo(notification.createdAt)}
              </span>
            </div>
            <p className="line-clamp-2 text-[12.5px] font-medium leading-snug text-zinc-200">
              {notification.title}
            </p>
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-zinc-500">
              {notification.body}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
