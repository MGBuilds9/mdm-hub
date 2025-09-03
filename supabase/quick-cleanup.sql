-- ========================================
-- Quick Cleanup Script - Run this first
-- ========================================

-- Drop the specific problematic triggers
DROP TRIGGER IF EXISTS audit_projects_trigger ON projects CASCADE;
DROP TRIGGER IF EXISTS audit_change_orders_trigger ON change_orders CASCADE;
DROP TRIGGER IF EXISTS audit_tasks_trigger ON tasks CASCADE;

-- Drop the functions that these triggers depend on
DROP FUNCTION IF EXISTS audit_trigger_function() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop helper functions with all parameter variations
DROP FUNCTION IF EXISTS get_current_user_id() CASCADE;
DROP FUNCTION IF EXISTS user_has_division_role(UUID, UUID, user_role) CASCADE;
DROP FUNCTION IF EXISTS user_has_division_role(uuid, uuid, user_role) CASCADE;
DROP FUNCTION IF EXISTS user_has_division_role CASCADE;
DROP FUNCTION IF EXISTS user_has_project_access(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS user_has_project_access(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS user_has_project_access CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Quick cleanup completed! You can now run the complete schema.';
END $$;
