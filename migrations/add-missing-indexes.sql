-- Add missing indexes on foreign key columns
-- Critical performance optimization for production readiness

BEGIN;

-- 1. Account.userId
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account" ("userId");
COMMENT ON INDEX "Account_userId_idx" IS 'Index for user account queries';

-- 2. ChatMessage.userId
CREATE INDEX IF NOT EXISTS "ChatMessage_userId_idx" ON "ChatMessage" ("userId");
COMMENT ON INDEX "ChatMessage_userId_idx" IS 'Index for user chat history queries';

-- 3. ContractorQuote.userId
CREATE INDEX IF NOT EXISTS "ContractorQuote_userId_idx" ON "ContractorQuote" ("userId");
COMMENT ON INDEX "ContractorQuote_userId_idx" IS 'Index for user quote queries';

-- 4. CostEstimate.userId
CREATE INDEX IF NOT EXISTS "CostEstimate_userId_idx" ON "CostEstimate" ("userId");
COMMENT ON INDEX "CostEstimate_userId_idx" IS 'Index for user cost estimate queries';

-- 5. CostEvent.conversationId
CREATE INDEX IF NOT EXISTS "CostEvent_conversationId_idx" ON "CostEvent" ("conversationId");
COMMENT ON INDEX "CostEvent_conversationId_idx" IS 'Index for conversation cost tracking';

-- 6. CostEvent.jobId
CREATE INDEX IF NOT EXISTS "CostEvent_jobId_idx" ON "CostEvent" ("jobId");
COMMENT ON INDEX "CostEvent_jobId_idx" IS 'Index for job cost tracking';

-- 7. QuoteLineItem.userId
CREATE INDEX IF NOT EXISTS "QuoteLineItem_userId_idx" ON "QuoteLineItem" ("userId");
COMMENT ON INDEX "QuoteLineItem_userId_idx" IS 'Index for user quote line item queries';

-- 8. Session.userId
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session" ("userId");
COMMENT ON INDEX "Session_userId_idx" IS 'Index for user session management';

-- 9. UploadedFile.userId
CREATE INDEX IF NOT EXISTS "UploadedFile_userId_idx" ON "UploadedFile" ("userId");
COMMENT ON INDEX "UploadedFile_userId_idx" IS 'Index for user file upload queries';

-- Verify all indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE '%_userId_idx'
OR indexname LIKE '%_conversationId_idx'
OR indexname LIKE '%_jobId_idx'
ORDER BY tablename, indexname;

COMMIT;