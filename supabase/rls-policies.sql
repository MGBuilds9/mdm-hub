-- Enhanced RLS Policies with Audit Logging
-- This file contains comprehensive Row Level Security policies for all tables
-- NOTE: Run schema.sql first to create the tables

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create additional indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON audit_logs(operation);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, operation, old_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, operation, new_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for all tables
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_projects_trigger
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_project_members_trigger
  AFTER INSERT OR UPDATE OR DELETE ON project_members
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_tasks_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_change_orders_trigger
  AFTER INSERT OR UPDATE OR DELETE ON change_orders
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Helper function to get user divisions
CREATE OR REPLACE FUNCTION get_user_divisions(user_id UUID)
RETURNS TABLE(division_id UUID, division_name TEXT, role TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.name, pm.role
  FROM divisions d
  JOIN project_members pm ON d.id = pm.division_id
  WHERE pm.user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check project access
CREATE OR REPLACE FUNCTION user_has_project_access(user_id UUID, project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM project_members pm
    JOIN projects p ON pm.project_id = p.id
    WHERE pm.user_id = user_id 
    AND p.id = project_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to set current user context
CREATE OR REPLACE FUNCTION set_current_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- This function can be used to set user context for RLS
  -- In practice, RLS uses auth.uid() automatically
  PERFORM 1; -- Placeholder
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USERS TABLE POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Service role can insert users (for admin operations)
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Service role can view all users
CREATE POLICY "Service role can view all users" ON users
  FOR SELECT USING (auth.role() = 'service_role');

-- Service role can update all users
CREATE POLICY "Service role can update all users" ON users
  FOR UPDATE USING (auth.role() = 'service_role');

-- PROJECTS TABLE POLICIES
-- Users can view projects they are members of
CREATE POLICY "Users can view projects they are members of" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = projects.id
      AND pm.user_id = auth.uid()
    )
  );

-- Project managers can update projects they manage
CREATE POLICY "Project managers can update projects" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = projects.id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('manager', 'admin')
    )
  );

-- Project managers can insert projects
CREATE POLICY "Project managers can create projects" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = projects.id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('manager', 'admin')
    )
  );

-- Service role can do everything with projects
CREATE POLICY "Service role can manage all projects" ON projects
  FOR ALL USING (auth.role() = 'service_role');

-- PROJECT_MEMBERS TABLE POLICIES
-- Users can view project members of projects they belong to
CREATE POLICY "Users can view project members" ON project_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
    )
  );

-- Project managers can manage project members
CREATE POLICY "Project managers can manage members" ON project_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('manager', 'admin')
    )
  );

-- Service role can manage all project members
CREATE POLICY "Service role can manage all project members" ON project_members
  FOR ALL USING (auth.role() = 'service_role');

-- TASKS TABLE POLICIES
-- Users can view tasks from projects they are members of
CREATE POLICY "Users can view project tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = tasks.project_id
      AND pm.user_id = auth.uid()
    )
  );

-- Users can create tasks in projects they belong to
CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = tasks.project_id
      AND pm.user_id = auth.uid()
    )
  );

-- Task assignees and project managers can update tasks
CREATE POLICY "Users can update tasks" ON tasks
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = tasks.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('manager', 'admin')
    )
  );

-- Project managers can delete tasks
CREATE POLICY "Project managers can delete tasks" ON tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = tasks.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('manager', 'admin')
    )
  );

-- Service role can manage all tasks
CREATE POLICY "Service role can manage all tasks" ON tasks
  FOR ALL USING (auth.role() = 'service_role');

-- CHANGE_ORDERS TABLE POLICIES
-- Users can view change orders from projects they are members of
CREATE POLICY "Users can view project change orders" ON change_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = change_orders.project_id
      AND pm.user_id = auth.uid()
    )
  );

-- Project managers can manage change orders
CREATE POLICY "Project managers can manage change orders" ON change_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = change_orders.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('manager', 'admin')
    )
  );

-- Service role can manage all change orders
CREATE POLICY "Service role can manage all change orders" ON change_orders
  FOR ALL USING (auth.role() = 'service_role');

-- AUDIT_LOGS TABLE POLICIES
-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- Service role can view all audit logs
CREATE POLICY "Service role can view all audit logs" ON audit_logs
  FOR SELECT USING (auth.role() = 'service_role');

-- No one can modify audit logs (they are append-only)
CREATE POLICY "Audit logs are read-only" ON audit_logs
  FOR ALL USING (false);

-- Performance optimization: Create partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_project_members_user_project ON project_members(user_id, project_id);

-- Create materialized view for user project access (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_project_access AS
SELECT 
  u.id as user_id,
  u.email,
  p.id as project_id,
  p.name as project_name,
  pm.role,
  pm.created_at as member_since
FROM users u
JOIN project_members pm ON u.id = pm.user_id
JOIN projects p ON pm.project_id = p.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_project_access_unique 
ON user_project_access(user_id, project_id);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_user_project_access()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_project_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Permissions are granted in schema.sql
