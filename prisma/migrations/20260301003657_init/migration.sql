-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TimeHorizon" AS ENUM ('ONE_YEAR', 'THREE_YEAR', 'FIVE_YEAR', 'TEN_YEAR');

-- CreateEnum
CREATE TYPE "GeographicFlexibility" AS ENUM ('LOCAL', 'NATIONAL', 'GLOBAL', 'REMOTE_ONLY');

-- CreateEnum
CREATE TYPE "WorkEnvironment" AS ENUM ('REMOTE', 'HYBRID', 'IN_PERSON', 'NO_PREFERENCE');

-- CreateEnum
CREATE TYPE "VisaStatus" AS ENUM ('CITIZEN', 'PERMANENT_RESIDENT', 'WORK_VISA', 'OTHER');

-- CreateEnum
CREATE TYPE "LearningStyle" AS ENUM ('COURSES', 'PROJECTS', 'MENTORSHIP', 'READING', 'MIXED');

-- CreateEnum
CREATE TYPE "SignalCategory" AS ENUM ('JOB_MARKET', 'CAPITAL_FLOWS', 'SKILL_DEMAND', 'DISPLACEMENT_RISK', 'POLICY');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "ScrapingStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentRole" TEXT,
    "currentIndustry" TEXT,
    "yearsOfExperience" INTEGER,
    "educationLevel" TEXT,
    "educationField" TEXT,
    "learningSkills" TEXT[],
    "desiredSkills" TEXT[],
    "targetRoles" TEXT[],
    "targetIndustries" TEXT[],
    "targetTimeHorizon" "TimeHorizon",
    "incomeGoal" INTEGER,
    "currentCompensation" INTEGER,
    "geographicFlexibility" "GeographicFlexibility",
    "currentLocation" TEXT,
    "workEnvironmentPreference" "WorkEnvironment",
    "riskTolerance" INTEGER,
    "autonomyVsStatus" INTEGER,
    "ambiguityTolerance" INTEGER,
    "familyConstraints" BOOLEAN,
    "visaStatus" "VisaStatus",
    "entrepreneurialInterest" BOOLEAN,
    "networkStrengthByIndustry" JSONB,
    "hoursPerWeekForLearning" INTEGER,
    "preferredLearningStyle" "LearningStyle",
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrimarySkill" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "proficiencyLevel" INTEGER NOT NULL,
    "yearsUsed" DOUBLE PRECISION,

    CONSTRAINT "PrimarySkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MacroSignal" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "category" "SignalCategory" NOT NULL,
    "topic" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "dataPoint" TEXT NOT NULL,
    "sentiment" "Sentiment" NOT NULL,
    "magnitude" INTEGER NOT NULL,
    "relevantIndustries" TEXT[],
    "relevantRoles" TEXT[],
    "relevantSkills" TEXT[],
    "scrapedAt" TIMESTAMP(3) NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "rawContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MacroSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "skillsToAccelerate" JSONB NOT NULL,
    "skillsToDeprioritize" JSONB NOT NULL,
    "skillsToWatch" JSONB NOT NULL,
    "rolesToTarget" JSONB NOT NULL,
    "rolesToAvoid" JSONB NOT NULL,
    "industriesToMoveToward" JSONB NOT NULL,
    "industriesToAvoid" JSONB NOT NULL,
    "keyNarrativeToTell" TEXT NOT NULL,
    "incomeTrajectoryAssessment" TEXT NOT NULL,
    "biggestRisks" TEXT[],
    "biggestOpportunities" TEXT[],
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,

    CONSTRAINT "CareerRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapingRun" (
    "id" TEXT NOT NULL,
    "scraperName" TEXT NOT NULL,
    "status" "ScrapingStatus" NOT NULL,
    "signalsFound" INTEGER NOT NULL DEFAULT 0,
    "signalsSaved" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ScrapingRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RecommendationSignals" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RecommendationSignals_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "PrimarySkill_profileId_idx" ON "PrimarySkill"("profileId");

-- CreateIndex
CREATE INDEX "MacroSignal_category_idx" ON "MacroSignal"("category");

-- CreateIndex
CREATE INDEX "MacroSignal_scrapedAt_idx" ON "MacroSignal"("scrapedAt");

-- CreateIndex
CREATE INDEX "MacroSignal_source_idx" ON "MacroSignal"("source");

-- CreateIndex
CREATE INDEX "MacroSignal_sentiment_idx" ON "MacroSignal"("sentiment");

-- CreateIndex
CREATE INDEX "CareerRecommendation_userId_isLatest_idx" ON "CareerRecommendation"("userId", "isLatest");

-- CreateIndex
CREATE INDEX "CareerRecommendation_generatedAt_idx" ON "CareerRecommendation"("generatedAt");

-- CreateIndex
CREATE INDEX "ScrapingRun_scraperName_idx" ON "ScrapingRun"("scraperName");

-- CreateIndex
CREATE INDEX "ScrapingRun_startedAt_idx" ON "ScrapingRun"("startedAt");

-- CreateIndex
CREATE INDEX "ScrapingRun_status_idx" ON "ScrapingRun"("status");

-- CreateIndex
CREATE INDEX "_RecommendationSignals_B_index" ON "_RecommendationSignals"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrimarySkill" ADD CONSTRAINT "PrimarySkill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerRecommendation" ADD CONSTRAINT "CareerRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecommendationSignals" ADD CONSTRAINT "_RecommendationSignals_A_fkey" FOREIGN KEY ("A") REFERENCES "CareerRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecommendationSignals" ADD CONSTRAINT "_RecommendationSignals_B_fkey" FOREIGN KEY ("B") REFERENCES "MacroSignal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
