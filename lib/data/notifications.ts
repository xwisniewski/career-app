import "server-only";
import { db } from "@/lib/db";
import type { NotificationSeverity } from "@/app/generated/prisma/client";

export type SignalNotificationRow = {
  id: string;
  title: string;
  body: string;
  severity: NotificationSeverity;
  score: number;
  createdAt: string;
  readAt: string | null;
  signal: {
    id: string;
    headline: string;
    source: string;
    sourceUrl: string;
    sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  };
};

export async function getUnreadSignalNotifications(userId: string): Promise<SignalNotificationRow[]> {
  const notifications = await db.signalNotification.findMany({
    where: { userId, readAt: null },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    take: 5,
    include: {
      signal: {
        select: {
          id: true,
          headline: true,
          source: true,
          sourceUrl: true,
          sentiment: true,
        },
      },
    },
  });

  return notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    body: notification.body,
    severity: notification.severity,
    score: notification.score,
    createdAt: notification.createdAt.toISOString(),
    readAt: notification.readAt?.toISOString() ?? null,
    signal: {
      id: notification.signal.id,
      headline: notification.signal.headline,
      source: notification.signal.source,
      sourceUrl: notification.signal.sourceUrl,
      sentiment: notification.signal.sentiment,
    },
  }));
}
