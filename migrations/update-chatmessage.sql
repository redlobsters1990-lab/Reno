-- Update ChatMessage table to match new schema
BEGIN;

-- Add conversationId column
ALTER TABLE "ChatMessage" 
ADD COLUMN "conversationId" TEXT;

-- Make projectId nullable
ALTER TABLE "ChatMessage" 
ALTER COLUMN "projectId" DROP NOT NULL;

-- Add foreign key for conversation
ALTER TABLE "ChatMessage" 
ADD CONSTRAINT "ChatMessage_conversationId_fkey" 
FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE;

-- Create index on conversationId
CREATE INDEX IF NOT EXISTS "ChatMessage_conversationId_createdAt_idx" 
ON "ChatMessage"("conversationId", "createdAt");

COMMIT;