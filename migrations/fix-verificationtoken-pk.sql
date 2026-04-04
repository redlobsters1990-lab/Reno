-- Fix VerificationToken primary key issue
-- This table currently has NO primary key, causing Prisma Studio count queries to fail

BEGIN;

-- First, check current structure
SELECT 'Current VerificationToken structure:' as info;
\d "VerificationToken";

-- Add composite primary key (identifier, token) as defined in Prisma schema
ALTER TABLE "VerificationToken" 
ADD CONSTRAINT "VerificationToken_pkey" 
PRIMARY KEY (identifier, token);

-- Verify the change
SELECT 'After fix - VerificationToken structure:' as info;
\d "VerificationToken";

COMMIT;