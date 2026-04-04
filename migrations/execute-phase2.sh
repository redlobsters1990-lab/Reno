#!/bin/bash
# Phase 2 Database Migration Execution Script
# Date: 2026-04-03

set -e  # Exit on error

echo "=== PHASE 2 DATABASE MIGRATION ==="
echo "Database: renovation_advisor"
echo "Starting at: $(date)"

# Step 1: Backup current database
echo "Step 1: Creating database backup..."
BACKUP_FILE="backup_renovation_advisor_$(date +%Y%m%d_%H%M%S).sql"
pg_dump "postgresql://chozengone@localhost:5432/renovation_advisor" > "$BACKUP_FILE"
echo "Backup created: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# Step 2: Check current state
echo "Step 2: Checking current database state..."
psql "postgresql://chozengone@localhost:5432/renovation_advisor" -c "
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c2 
     WHERE c2.table_name = c.table_name 
     AND c2.column_name = 'userId') as has_user_id,
    (SELECT COUNT(*) FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
     WHERE tc.table_name = c.table_name 
     AND tc.constraint_type = 'FOREIGN KEY'
     AND kcu.column_name = 'userId') as has_user_fk
FROM information_schema.columns c
WHERE table_schema = 'public'
AND table_name IN ('UploadedFile', 'CostEstimate', 'ContractorQuote', 'QuoteLineItem')
GROUP BY table_name
ORDER BY table_name;
"

# Step 3: Execute migration in transaction
echo "Step 3: Executing migration..."
psql "postgresql://chozengone@localhost:5432/renovation_advisor" << EOF
BEGIN;

-- Run migration steps from phase2-migration.sql
-- (The actual SQL commands would be executed here)
-- For safety, we'll run them step by step

-- Add columns
ALTER TABLE "UploadedFile" ADD COLUMN "userId" TEXT;
ALTER TABLE "CostEstimate" ADD COLUMN "userId" TEXT;
ALTER TABLE "ContractorQuote" ADD COLUMN "userId" TEXT;
ALTER TABLE "QuoteLineItem" ADD COLUMN "userId" TEXT;

-- Backfill data
UPDATE "UploadedFile" uf SET "userId" = p."userId" FROM "Project" p WHERE uf."projectId" = p.id;
UPDATE "CostEstimate" ce SET "userId" = p."userId" FROM "Project" p WHERE ce."projectId" = p.id;
UPDATE "ContractorQuote" cq SET "userId" = p."userId" FROM "Project" p WHERE cq."projectId" = p.id;
UPDATE "QuoteLineItem" qli SET "userId" = p."userId" FROM "ContractorQuote" cq JOIN "Project" p ON cq."projectId" = p.id WHERE qli."quoteId" = cq.id;

-- Make columns NOT NULL
ALTER TABLE "UploadedFile" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "CostEstimate" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "ContractorQuote" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "QuoteLineItem" ALTER COLUMN "userId" SET NOT NULL;

-- Add foreign keys
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;
ALTER TABLE "CostEstimate" ADD CONSTRAINT "CostEstimate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;
ALTER TABLE "ContractorQuote" ADD CONSTRAINT "ContractorQuote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;
ALTER TABLE "QuoteLineItem" ADD CONSTRAINT "QuoteLineItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;

COMMIT;
EOF

echo "Step 4: Migration completed successfully!"
echo "Verifying results..."

# Step 4: Verify migration
psql "postgresql://chozengone@localhost:5432/renovation_advisor" -c "
SELECT 'Migration Results' as section;
SELECT table_name, COUNT(*) as record_count 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'userId' 
AND table_name IN ('UploadedFile', 'CostEstimate', 'ContractorQuote', 'QuoteLineItem')
GROUP BY table_name;

SELECT 'Orphan Check' as section;
SELECT 'UploadedFile' as table_name, COUNT(*) as orphan_count 
FROM \"UploadedFile\" WHERE \"userId\" IS NULL
UNION ALL
SELECT 'CostEstimate', COUNT(*) FROM \"CostEstimate\" WHERE \"userId\" IS NULL
UNION ALL
SELECT 'ContractorQuote', COUNT(*) FROM \"ContractorQuote\" WHERE \"userId\" IS NULL
UNION ALL
SELECT 'QuoteLineItem', COUNT(*) FROM \"QuoteLineItem\" WHERE \"userId\" IS NULL;
"

echo "=== MIGRATION COMPLETE ==="
echo "Backup file: $BACKUP_FILE"
echo "Next steps:"
echo "1. Update Prisma schema (prisma/schema-new.prisma -> prisma/schema.prisma)"
echo "2. Run: npx prisma generate"
echo "3. Restart application"