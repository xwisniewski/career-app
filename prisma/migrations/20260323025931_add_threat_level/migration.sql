-- CreateTable
CREATE TABLE "OccupationExposure" (
    "id" TEXT NOT NULL,
    "onetsocCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "observedExposure" DOUBLE PRECISION NOT NULL,
    "theoreticalExposure" DOUBLE PRECISION,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OccupationExposure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreatLevelSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "previousScore" INTEGER,
    "roleRisk" INTEGER NOT NULL,
    "industryRisk" INTEGER NOT NULL,
    "skillsGap" INTEGER NOT NULL,
    "companyTypeRisk" INTEGER NOT NULL,
    "matchedOccupation" TEXT,
    "exposureScore" DOUBLE PRECISION,
    "signalDrivers" JSONB NOT NULL,
    "counterfactors" JSONB NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThreatLevelSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OccupationExposure_onetsocCode_key" ON "OccupationExposure"("onetsocCode");

-- CreateIndex
CREATE INDEX "OccupationExposure_title_idx" ON "OccupationExposure"("title");

-- CreateIndex
CREATE INDEX "ThreatLevelSnapshot_userId_idx" ON "ThreatLevelSnapshot"("userId");

-- CreateIndex
CREATE INDEX "ThreatLevelSnapshot_date_idx" ON "ThreatLevelSnapshot"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ThreatLevelSnapshot_userId_date_key" ON "ThreatLevelSnapshot"("userId", "date");

-- AddForeignKey
ALTER TABLE "ThreatLevelSnapshot" ADD CONSTRAINT "ThreatLevelSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
