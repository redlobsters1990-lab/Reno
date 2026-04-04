-- Migration to add new columns to existing tables
-- Based on schema-new.prisma

BEGIN;

-- Add columns to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;

-- Add columns to Project table (if missing)
ALTER TABLE "Project"
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;

-- Create new tables from schema
-- Note: We'll create these tables if they don't exist
-- Conversation, Job, UserActivity, CostEvent, etc.

-- Create Conversation table
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT,
    "status" TEXT DEFAULT 'active',
    "metadata" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "Conversation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE
);

-- Create Job table
CREATE TABLE IF NOT EXISTS "Job" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT,
    "projectId" TEXT,
    "jobType" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "input" TEXT,
    "output" TEXT,
    "error" TEXT,
    "metadata" TEXT,
    "startedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "Job_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "Job_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE,
    CONSTRAINT "Job_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE
);

-- Create UserActivity table
CREATE TABLE IF NOT EXISTS "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create CostEvent table
CREATE TABLE IF NOT EXISTS "CostEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "conversationId" TEXT,
    "jobId" TEXT,
    "eventType" TEXT NOT NULL,
    "units" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'USD',
    "metadata" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "CostEvent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CostEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "CostEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE,
    CONSTRAINT "CostEvent_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE,
    CONSTRAINT "CostEvent_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_status_createdAt_idx" ON "User"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "User_lastActiveAt_idx" ON "User"("lastActiveAt");

CREATE INDEX IF NOT EXISTS "Conversation_userId_createdAt_idx" ON "Conversation"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Conversation_projectId_status_idx" ON "Conversation"("projectId", "status");
CREATE INDEX IF NOT EXISTS "Conversation_status_updatedAt_idx" ON "Conversation"("status", "updatedAt");

CREATE INDEX IF NOT EXISTS "Job_userId_status_createdAt_idx" ON "Job"("userId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "Job_jobType_status_startedAt_idx" ON "Job"("jobType", "status", "startedAt");
CREATE INDEX IF NOT EXISTS "Job_conversationId_createdAt_idx" ON "Job"("conversationId", "createdAt");
CREATE INDEX IF NOT EXISTS "Job_projectId_createdAt_idx" ON "Job"("projectId", "createdAt");

CREATE INDEX IF NOT EXISTS "UserActivity_userId_createdAt_idx" ON "UserActivity"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "UserActivity_activityType_createdAt_idx" ON "UserActivity"("activityType", "createdAt");
CREATE INDEX IF NOT EXISTS "UserActivity_entityType_entityId_idx" ON "UserActivity"("entityType", "entityId");

CREATE INDEX IF NOT EXISTS "CostEvent_userId_createdAt_idx" ON "CostEvent"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "CostEvent_eventType_createdAt_idx" ON "CostEvent"("eventType", "createdAt");
CREATE INDEX IF NOT EXISTS "CostEvent_projectId_createdAt_idx" ON "CostEvent"("projectId", "createdAt");

COMMIT;