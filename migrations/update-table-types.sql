-- Update tables to use enum types
BEGIN;

-- Update Conversation table to use ConversationStatus enum
ALTER TABLE "Conversation" 
ALTER COLUMN "status" TYPE "ConversationStatus" 
USING "status"::"ConversationStatus";

-- Update Job table to use JobStatus and JobType enums
ALTER TABLE "Job" 
ALTER COLUMN "status" TYPE "JobStatus" 
USING "status"::"JobStatus";

ALTER TABLE "Job" 
ALTER COLUMN "jobType" TYPE "JobType" 
USING "jobType"::"JobType";

-- Update UserActivity table to use ActivityType enum
ALTER TABLE "UserActivity" 
ALTER COLUMN "activityType" TYPE "ActivityType" 
USING "activityType"::"ActivityType";

-- Update CostEvent table to use CostEventType enum
ALTER TABLE "CostEvent" 
ALTER COLUMN "eventType" TYPE "CostEventType" 
USING "eventType"::"CostEventType";

COMMIT;