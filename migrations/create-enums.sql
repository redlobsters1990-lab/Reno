-- Create enum types for the new schema
BEGIN;

-- Drop existing types if they exist (careful in production!)
DROP TYPE IF EXISTS "public"."ConversationStatus" CASCADE;
DROP TYPE IF EXISTS "public"."JobStatus" CASCADE;
DROP TYPE IF EXISTS "public"."JobType" CASCADE;
DROP TYPE IF EXISTS "public"."ActivityType" CASCADE;
DROP TYPE IF EXISTS "public"."CostEventType" CASCADE;

-- Create ConversationStatus enum
CREATE TYPE "public"."ConversationStatus" AS ENUM ('active', 'archived', 'completed');

-- Create JobStatus enum
CREATE TYPE "public"."JobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- Create JobType enum
CREATE TYPE "public"."JobType" AS ENUM (
    'cost_estimation',
    'quote_analysis',
    'memory_processing',
    'file_processing',
    'chat_generation'
);

-- Create ActivityType enum
CREATE TYPE "public"."ActivityType" AS ENUM (
    'login',
    'logout',
    'project_create',
    'project_update',
    'project_delete',
    'chat_message',
    'file_upload',
    'cost_estimate',
    'quote_upload',
    'job_started',
    'job_completed',
    'job_failed',
    'settings_update'
);

-- Create CostEventType enum
CREATE TYPE "public"."CostEventType" AS ENUM (
    'chat_message',
    'cost_estimation',
    'quote_analysis',
    'file_processing',
    'memory_processing'
);

COMMIT;