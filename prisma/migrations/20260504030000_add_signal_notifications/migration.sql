-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SIGNAL_MATCH');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'WATCH', 'IMPORTANT', 'URGENT');

-- CreateTable
CREATE TABLE "SignalNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SIGNAL_MATCH',
    "severity" "NotificationSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "readAt" TIMESTAMP(3),
    "emailedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignalNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SignalNotification_userId_signalId_type_key" ON "SignalNotification"("userId", "signalId", "type");

-- CreateIndex
CREATE INDEX "SignalNotification_userId_readAt_idx" ON "SignalNotification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "SignalNotification_createdAt_idx" ON "SignalNotification"("createdAt");

-- CreateIndex
CREATE INDEX "SignalNotification_severity_idx" ON "SignalNotification"("severity");

-- AddForeignKey
ALTER TABLE "SignalNotification" ADD CONSTRAINT "SignalNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalNotification" ADD CONSTRAINT "SignalNotification_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "MacroSignal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
