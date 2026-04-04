-- Recreate tables with correct enum types
BEGIN;

-- Drop tables (they're empty)
DROP TABLE IF EXISTS "CostEvent" CASCADE;
DROP TABLE IF EXISTS "UserActivity" CASCADE;
DROP TABLE IF EXISTS "Job" CASCADE;
DROP TABLE IF EXISTS "Conversation" CASCADE;

-- Recreate Conversation table with enum
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT,
    "status" "ConversationStatus" DEFAULT 'active',
    "metadata" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "Conversation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE
);

-- Recreate Job table with enums
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT,
    "projectId" TEXT,
    "jobType" "JobType" NOT NULL,
    "status" "JobStatus" DEFAULT 'pending',
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

-- Recreate UserActivity table with enum
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
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

-- Recreate CostEvent table with enum
CREATE TABLE "CostEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "conversationId" TEXT,
    "jobId" TEXT,
    "eventType" "CostEventType" NOT NULL,
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

-- Recreate indexes
CREATE INDEX "Conversation_userId_createdAt_idx" ON "Conversation"("userId", "createdAt");
CREATE INDEX "Conversation_projectId_status_idx" ON "Conversation"("projectId", "status");
CREATE INDEX "Conversation_status_updatedAt_idx" ON "Conversation"("status", "updatedAt");

CREATE INDEX "Job_userId_status_createdAt_idx" ON "Job"("userId", "status", "createdAt");
CREATE INDEX "Job_jobType_status_startedAt_idx" ON "Job"("jobType", "status", "startedAt");
CREATE INDEX "Job_conversationId_createdAt_idx" ON "Job"("conversationId", "createdAt");
CREATE INDEX "Job_projectId_createdAt_idx" ON "Job"("projectId", "createdAt");

CREATE INDEX "UserActivity_userId_createdAt_idx" ON "UserActivity"("userId", "createdAt");
CREATE INDEX "UserActivity_activityType_createdAt_idx" ON "UserActivity"("activityType", "createdAt");
CREATE INDEX "UserActivity_entityType_entityId_idx" ON "UserActivity"("entityType", "entityId");

CREATE INDEX "CostEvent_userId_createdAt_idx" ON "CostEvent"("userId", "createdAt");
CREATE INDEX "CostEvent_eventType_createdAt_idx" ON "CostEvent"("eventType", "createdAt");
CREATE INDEX "CostEvent_projectId_createdAt_idx" ON "CostEvent"("projectId", "createdAt");

COMMIT;