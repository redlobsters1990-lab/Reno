-- PHASE 2 DATABASE MIGRATION
-- User-Centric Architecture Upgrade
-- Date: 2026-04-03

-- ========== STEP 1: ADD COLUMNS TO EXISTING TABLES ==========

-- Add userId to UploadedFile (nullable first)
ALTER TABLE "UploadedFile" ADD COLUMN "userId" TEXT;

-- Add userId to CostEstimate
ALTER TABLE "CostEstimate" ADD COLUMN "userId" TEXT;

-- Add userId to ContractorQuote  
ALTER TABLE "ContractorQuote" ADD COLUMN "userId" TEXT;

-- Add userId to QuoteLineItem
ALTER TABLE "QuoteLineItem" ADD COLUMN "userId" TEXT;

-- Add audit fields to User
ALTER TABLE "User" ADD COLUMN "role" TEXT DEFAULT 'user';
ALTER TABLE "User" ADD COLUMN "status" TEXT DEFAULT 'active';
ALTER TABLE "User" ADD COLUMN "lastActiveAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Add conversationId to ChatMessage (nullable)
ALTER TABLE "ChatMessage" ADD COLUMN "conversationId" TEXT;

-- ========== STEP 2: BACKFILL USER IDs ==========

-- Backfill UploadedFile.userId from Project
UPDATE "UploadedFile" uf
SET "userId" = p."userId"
FROM "Project" p
WHERE uf."projectId" = p.id;

-- Backfill CostEstimate.userId from Project
UPDATE "CostEstimate" ce
SET "userId" = p."userId"
FROM "Project" p
WHERE ce."projectId" = p.id;

-- Backfill ContractorQuote.userId from Project
UPDATE "ContractorQuote" cq
SET "userId" = p."userId"
FROM "Project" p
WHERE cq."projectId" = p.id;

-- Backfill QuoteLineItem.userId from ContractorQuote→Project
UPDATE "QuoteLineItem" qli
SET "userId" = p."userId"
FROM "ContractorQuote" cq
JOIN "Project" p ON cq."projectId" = p.id
WHERE qli."quoteId" = cq.id;

-- ========== STEP 3: CREATE NEW TABLES ==========

-- Create Conversation table
CREATE TABLE "Conversation" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT,
    "status" TEXT DEFAULT 'active',
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON DELETE SET NULL
);

-- Create Job table
CREATE TABLE "Job" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT,
    "projectId" TEXT,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "input" TEXT,
    "output" TEXT,
    "error" TEXT,
    "metadata" TEXT,
    "startedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY ("conversationId") REFERENCES "Conversation"(id) ON DELETE SET NULL,
    FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON DELETE SET NULL
);

-- Create UserActivity table
CREATE TABLE "UserActivity" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create CostEvent table
CREATE TABLE "CostEvent" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "conversationId" TEXT,
    "jobId" TEXT,
    "eventType" TEXT NOT NULL,
    "units" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'USD',
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON DELETE SET NULL,
    FOREIGN KEY ("conversationId") REFERENCES "Conversation"(id) ON DELETE SET NULL,
    FOREIGN KEY ("jobId") REFERENCES "Job"(id) ON DELETE SET NULL
);

-- Create ContractorProfile table
CREATE TABLE "ContractorProfile" (
    "id" TEXT PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "specialties" TEXT[],
    "serviceAreas" TEXT[],
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER DEFAULT 0,
    "minProjectSize" DOUBLE PRECISION,
    "maxProjectSize" DOUBLE PRECISION,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create ContractorMatchResult table
CREATE TABLE "ContractorMatchResult" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT,
    "recommendationLevel" TEXT DEFAULT 'suggested',
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON DELETE CASCADE,
    FOREIGN KEY ("contractorId") REFERENCES "ContractorProfile"(id) ON DELETE CASCADE
);

-- Create TimelinePrediction table
CREATE TABLE "TimelinePrediction" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "predictionType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "durationDays" INTEGER,
    "confidence" DOUBLE PRECISION,
    "milestones" TEXT,
    "assumptions" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY ("projectId") REFERENCES "Project"(id) ON DELETE CASCADE
);

-- ========== STEP 4: ADD CONSTRAINTS ==========

-- Make userId columns NOT NULL
ALTER TABLE "UploadedFile" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "CostEstimate" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "ContractorQuote" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "QuoteLineItem" ALTER COLUMN "userId" SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;

ALTER TABLE "CostEstimate" ADD CONSTRAINT "CostEstimate_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;

ALTER TABLE "ContractorQuote" ADD CONSTRAINT "ContractorQuote_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;

ALTER TABLE "QuoteLineItem" ADD CONSTRAINT "QuoteLineItem_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;

-- Add primary key to VerificationToken
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_pkey"
  PRIMARY KEY (identifier, token);

-- ========== STEP 5: ADD INDEXES ==========

-- User-centric indexes
CREATE INDEX "UploadedFile_userId_idx" ON "UploadedFile"("userId");
CREATE INDEX "CostEstimate_userId_idx" ON "CostEstimate"("userId");
CREATE INDEX "ContractorQuote_userId_idx" ON "ContractorQuote"("userId");
CREATE INDEX "QuoteLineItem_userId_idx" ON "QuoteLineItem"("userId");
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "User_lastActiveAt_idx" ON "User"("lastActiveAt");

-- Conversation indexes
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");
CREATE INDEX "Conversation_projectId_idx" ON "Conversation"("projectId");
CREATE INDEX "Conversation_status_idx" ON "Conversation"("status");

-- Job indexes
CREATE INDEX "Job_userId_status_idx" ON "Job"("userId", "status");
CREATE INDEX "Job_jobType_status_idx" ON "Job"("jobType", "status");
CREATE INDEX "Job_conversationId_idx" ON "Job"("conversationId");
CREATE INDEX "Job_projectId_idx" ON "Job"("projectId");

-- Activity indexes
CREATE INDEX "UserActivity_userId_createdAt_idx" ON "UserActivity"("userId", "createdAt" DESC);
CREATE INDEX "UserActivity_activityType_idx" ON "UserActivity"("activityType");
CREATE INDEX "UserActivity_entity_idx" ON "UserActivity"("entityType", "entityId");

-- CostEvent indexes
CREATE INDEX "CostEvent_userId_idx" ON "CostEvent"("userId");
CREATE INDEX "CostEvent_eventType_idx" ON "CostEvent"("eventType");
CREATE INDEX "CostEvent_projectId_idx" ON "CostEvent"("projectId");

-- Contractor matching indexes
CREATE INDEX "ContractorMatchResult_userId_idx" ON "ContractorMatchResult"("userId");
CREATE INDEX "ContractorMatchResult_projectId_idx" ON "ContractorMatchResult"("projectId");
CREATE INDEX "ContractorMatchResult_contractorId_idx" ON "ContractorMatchResult"("contractorId");
CREATE INDEX "ContractorMatchResult_matchScore_idx" ON "ContractorMatchResult"("matchScore" DESC);

-- Timeline prediction indexes
CREATE INDEX "TimelinePrediction_userId_idx" ON "TimelinePrediction"("userId");
CREATE INDEX "TimelinePrediction_projectId_idx" ON "TimelinePrediction"("projectId");
CREATE INDEX "TimelinePrediction_predictionType_idx" ON "TimelinePrediction"("predictionType");

-- Contractor profile indexes
CREATE INDEX "ContractorProfile_location_idx" ON "ContractorProfile"("location");
CREATE INDEX "ContractorProfile_specialties_idx" ON "ContractorProfile" USING GIN("specialties");
CREATE INDEX "ContractorProfile_rating_idx" ON "ContractorProfile"("rating" DESC);

-- ========== STEP 6: CREATE CONVERSATIONS FOR EXISTING CHAT MESSAGES ==========

-- Create one conversation per project for existing messages
INSERT INTO "Conversation" (id, "userId", "projectId", title, status, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    p."userId",
    p.id,
    'Project Chat - ' || p.title,
    'active',
    MIN(cm."createdAt"),
    MAX(cm."createdAt")
FROM "ChatMessage" cm
JOIN "Project" p ON cm."projectId" = p.id
GROUP BY p.id, p."userId", p.title;

-- Update ChatMessage.conversationId
UPDATE "ChatMessage" cm
SET "conversationId" = c.id
FROM "Conversation" c
WHERE cm."projectId" = c."projectId";

-- ========== STEP 7: VALIDATION QUERIES ==========

-- Check for orphaned records
SELECT 'UploadedFile without userId' as check_name, COUNT(*) as count 
FROM "UploadedFile" WHERE "userId" IS NULL
UNION ALL
SELECT 'CostEstimate without userId', COUNT(*) 
FROM "CostEstimate" WHERE "userId" IS NULL
UNION ALL
SELECT 'ContractorQuote without userId', COUNT(*) 
FROM "ContractorQuote" WHERE "userId" IS NULL
UNION ALL
SELECT 'QuoteLineItem without userId', COUNT(*) 
FROM "QuoteLineItem" WHERE "userId" IS NULL
UNION ALL
SELECT 'ChatMessage without conversationId', COUNT(*) 
FROM "ChatMessage" WHERE "conversationId" IS NULL;

-- Check foreign key integrity
SELECT 'UploadedFile FK violations' as check_name, COUNT(*) as count
FROM "UploadedFile" uf
LEFT JOIN "User" u ON uf."userId" = u.id
WHERE u.id IS NULL AND uf."userId" IS NOT NULL
UNION ALL
SELECT 'CostEstimate FK violations', COUNT(*)
FROM "CostEstimate" ce
LEFT JOIN "User" u ON ce."userId" = u.id
WHERE u.id IS NULL AND ce."userId" IS NOT NULL
UNION ALL
SELECT 'ContractorQuote FK violations', COUNT(*)
FROM "ContractorQuote" cq
LEFT JOIN "User" u ON cq."userId" = u.id
WHERE u.id IS NULL AND cq."userId" IS NOT NULL
UNION ALL
SELECT 'QuoteLineItem FK violations', COUNT(*)
FROM "QuoteLineItem" qli
LEFT JOIN "User" u ON qli."userId" = u.id
WHERE u.id IS NULL AND qli."userId" IS NOT NULL;