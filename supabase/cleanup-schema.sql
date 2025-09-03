-- ========================================
-- MDM Hub Database Cleanup Script
-- Run this BEFORE running the complete schema
-- ========================================

-- Drop all existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Drop all triggers (more comprehensive approach)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all triggers on all tables in public schema
    FOR r IN (
        SELECT trigger_name, event_object_table, event_object_schema 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
        AND event_object_schema = 'public'
    ) 
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON ' || quote_ident(r.event_object_schema) || '.' || quote_ident(r.event_object_table) || ' CASCADE';
    END LOOP;
END $$;

-- Drop specific triggers that might be causing issues
DROP TRIGGER IF EXISTS audit_projects_trigger ON projects CASCADE;
DROP TRIGGER IF EXISTS audit_change_orders_trigger ON change_orders CASCADE;
DROP TRIGGER IF EXISTS audit_tasks_trigger ON tasks CASCADE;
DROP TRIGGER IF EXISTS update_users_updated_at ON users CASCADE;
DROP TRIGGER IF EXISTS update_divisions_updated_at ON divisions CASCADE;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects CASCADE;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks CASCADE;
DROP TRIGGER IF EXISTS update_change_orders_updated_at ON change_orders CASCADE;
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents CASCADE;

-- Drop all functions (with all possible parameter combinations)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS audit_trigger_function() CASCADE;
DROP FUNCTION IF EXISTS get_current_user_id() CASCADE;

-- Drop functions with different parameter signatures
DROP FUNCTION IF EXISTS user_has_division_role(UUID, UUID, user_role) CASCADE;
DROP FUNCTION IF EXISTS user_has_division_role(uuid, uuid, user_role) CASCADE;
DROP FUNCTION IF EXISTS user_has_division_role CASCADE;

DROP FUNCTION IF EXISTS user_has_project_access(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS user_has_project_access(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS user_has_project_access CASCADE;

-- Drop all tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS change_orders CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS user_divisions CASCADE;
DROP TABLE IF EXISTS divisions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all enum types
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS change_order_status CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Drop extensions (optional - only if you want to remove them completely)
-- DROP EXTENSION IF EXISTS "pg_trgm" CASCADE;
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'MDM Hub database cleanup completed successfully!';
  RAISE NOTICE 'All tables, policies, triggers, functions, and types have been removed.';
  RAISE NOTICE 'You can now run the complete-schema.sql script.';
END $$;
