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
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function SignalAlerts({ notifications }: { notifications: SignalNotificationRow[] }) {
  if (notifications.length === 0) return null;

  return (
    <div className="rounded-[10px] border border-blue-500/20 bg-blue-500/5 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="label text-blue-300">Signal Alerts</p>
          <p className="mt-0.5 text-[12px] text-zinc-500">New macro signals matched to your profile</p>
        </div>
        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-300">
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
                className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${SEVERITY_STYLES[notification.severity]}`}
              >
                {notification.severity.toLowerCase()}
              </span>
              <span className="text-[10px] text-zinc-600">{timeAgo(notification.createdAt)}</span>
            </div>
            <p className="line-clamp-2 text-[12px] font-medium leading-snug text-zinc-200">
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
