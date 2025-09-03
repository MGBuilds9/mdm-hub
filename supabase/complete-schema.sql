-- ========================================
-- MDM Hub Complete Database Schema
-- Run this in your Supabase SQL Editor
-- ========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ========================================
-- PART 1: CORE TABLES
-- ========================================

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'supervisor', 'worker', 'client', 'subcontractor');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'review', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE change_order_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error', 'success');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supabase_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'worker',
  is_active BOOLEAN DEFAULT true,
  is_internal BOOLEAN DEFAULT false, -- Azure AD users
  last_login_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Divisions table (5 divisions: Group, Contracting, Homes, Wood, Telecom)
CREATE TABLE IF NOT EXISTS divisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE, -- SHORT CODE like 'GRP', 'CON', 'HOM', 'WOD', 'TEL'
  description TEXT,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-Division relationship (many-to-many)
CREATE TABLE IF NOT EXISTS user_divisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
  role user_role DEFAULT 'worker',
  is_primary BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, division_id)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE, -- Project code like 'MDM-2024-001'
  description TEXT,
  division_id UUID REFERENCES divisions(id) ON DELETE RESTRICT,
  status project_status DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15,2),
  spent DECIMAL(15,2) DEFAULT 0,
  location TEXT,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project members
CREATE TABLE IF NOT EXISTS project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'worker',
  hours_allocated DECIMAL(10,2),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority task_priority DEFAULT 'medium',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Change Orders table
CREATE TABLE IF NOT EXISTS change_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE, -- Like 'CO-2024-001'
  title TEXT NOT NULL,
  description TEXT,
  reason TEXT,
  cost_impact DECIMAL(15,2),
  schedule_impact_days INTEGER,
  status change_order_status DEFAULT 'draft',
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  documents JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  caption TEXT,
  tags TEXT[],
  exif_data JSONB,
  location JSONB, -- {lat, lng, address}
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Supabase storage path
  sharepoint_url TEXT, -- SharePoint reference
  mime_type TEXT,
  size_bytes INTEGER,
  version INTEGER DEFAULT 1,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type notification_type DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID,
  operation TEXT CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- PART 2: INDEXES FOR PERFORMANCE
-- ========================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_supabase_user_id ON users(supabase_user_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Divisions indexes
CREATE INDEX idx_divisions_code ON divisions(code);
CREATE INDEX idx_divisions_is_active ON divisions(is_active);

-- User divisions indexes
CREATE INDEX idx_user_divisions_user_id ON user_divisions(user_id);
CREATE INDEX idx_user_divisions_division_id ON user_divisions(division_id);
CREATE INDEX idx_user_divisions_composite ON user_divisions(user_id, division_id);

-- Projects indexes
CREATE INDEX idx_projects_division_id ON projects(division_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_manager_id ON projects(manager_id);
CREATE INDEX idx_projects_code ON projects(code);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- Project members indexes
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_composite ON project_members(project_id, user_id);

-- Tasks indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Change orders indexes
CREATE INDEX idx_change_orders_project_id ON change_orders(project_id);
CREATE INDEX idx_change_orders_status ON change_orders(status);
CREATE INDEX idx_change_orders_order_number ON change_orders(order_number);

-- Photos indexes
CREATE INDEX idx_photos_project_id ON photos(project_id);
CREATE INDEX idx_photos_task_id ON photos(task_id);
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by);

-- Documents indexes
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_operation ON audit_logs(operation);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ========================================
-- PART 3: TRIGGERS
-- ========================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON divisions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_change_orders_updated_at BEFORE UPDATE ON change_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, record_id, operation, old_data, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, record_id, operation, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, operation, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_projects_trigger
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_change_orders_trigger
  AFTER INSERT OR UPDATE OR DELETE ON change_orders
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_tasks_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ========================================
-- PART 4: ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (supabase_user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (supabase_user_id = auth.uid());

-- Users can create their own profile
CREATE POLICY "Users can create own profile" ON users
  FOR INSERT WITH CHECK (supabase_user_id = auth.uid());

-- Users can view other users in same divisions
CREATE POLICY "Users can view division members" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_divisions ud1
      JOIN user_divisions ud2 ON ud1.division_id = ud2.division_id
      WHERE ud1.user_id = users.id
      AND ud2.user_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Service role bypass
CREATE POLICY "Service role bypass" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- DIVISIONS TABLE POLICIES
-- All authenticated users can view active divisions
CREATE POLICY "Users can view active divisions" ON divisions
  FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

-- Division managers can update their divisions
CREATE POLICY "Managers can update their divisions" ON divisions
  FOR UPDATE USING (
    manager_id IN (
      SELECT id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

-- Service role bypass
CREATE POLICY "Service role bypass" ON divisions
  FOR ALL USING (auth.role() = 'service_role');

-- USER_DIVISIONS TABLE POLICIES
-- Users can view their own division memberships
CREATE POLICY "Users can view own memberships" ON user_divisions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

-- Division managers can manage memberships
CREATE POLICY "Managers can manage division members" ON user_divisions
  FOR ALL USING (
    division_id IN (
      SELECT id FROM divisions 
      WHERE manager_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Service role bypass
CREATE POLICY "Service role bypass" ON user_divisions
  FOR ALL USING (auth.role() = 'service_role');

-- PROJECTS TABLE POLICIES
-- Users can view projects in their divisions
CREATE POLICY "Users can view division projects" ON projects
  FOR SELECT USING (
    division_id IN (
      SELECT division_id FROM user_divisions 
      WHERE user_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
    OR
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Project managers can update their projects
CREATE POLICY "Managers can update their projects" ON projects
  FOR UPDATE USING (
    manager_id IN (
      SELECT id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

-- Division managers can create projects
CREATE POLICY "Division managers can create projects" ON projects
  FOR INSERT WITH CHECK (
    division_id IN (
      SELECT id FROM divisions 
      WHERE manager_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Service role bypass
CREATE POLICY "Service role bypass" ON projects
  FOR ALL USING (auth.role() = 'service_role');

-- PROJECT_MEMBERS TABLE POLICIES
-- Users can view members of projects they're in
CREATE POLICY "Users can view project members" ON project_members
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Project managers can manage members
CREATE POLICY "Managers can manage project members" ON project_members
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE manager_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Service role bypass
CREATE POLICY "Service role bypass" ON project_members
  FOR ALL USING (auth.role() = 'service_role');

-- TASKS TABLE POLICIES
-- Users can view tasks in their projects
CREATE POLICY "Users can view project tasks" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Users can create tasks in their projects
CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Users can update tasks assigned to them
CREATE POLICY "Users can update assigned tasks" ON tasks
  FOR UPDATE USING (
    assigned_to IN (
      SELECT id FROM users WHERE supabase_user_id = auth.uid()
    )
    OR
    project_id IN (
      SELECT id FROM projects 
      WHERE manager_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Service role bypass
CREATE POLICY "Service role bypass" ON tasks
  FOR ALL USING (auth.role() = 'service_role');

-- CHANGE_ORDERS TABLE POLICIES
-- Users can view change orders in their projects
CREATE POLICY "Users can view change orders" ON change_orders
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Project managers can manage change orders
CREATE POLICY "Managers can manage change orders" ON change_orders
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE manager_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Service role bypass
CREATE POLICY "Service role bypass" ON change_orders
  FOR ALL USING (auth.role() = 'service_role');

-- PHOTOS TABLE POLICIES
-- Users can view photos in their projects
CREATE POLICY "Users can view project photos" ON photos
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Users can upload photos to their projects
CREATE POLICY "Users can upload photos" ON photos
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos" ON photos
  FOR DELETE USING (
    uploaded_by IN (
      SELECT id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

-- Service role bypass
CREATE POLICY "Service role bypass" ON photos
  FOR ALL USING (auth.role() = 'service_role');

-- DOCUMENTS TABLE POLICIES
-- Users can view documents in their projects
CREATE POLICY "Users can view project documents" ON documents
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Users can upload documents to their projects
CREATE POLICY "Users can upload documents" ON documents
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id IN (
        SELECT id FROM users WHERE supabase_user_id = auth.uid()
      )
    )
  );

-- Service role bypass
CREATE POLICY "Service role bypass" ON documents
  FOR ALL USING (auth.role() = 'service_role');

-- NOTIFICATIONS TABLE POLICIES
-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE supabase_user_id = auth.uid()
    )
  );

-- Service role bypass
CREATE POLICY "Service role bypass" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

-- AUDIT_LOGS TABLE POLICIES
-- Only service role can view audit logs
CREATE POLICY "Service role only" ON audit_logs
  FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- PART 5: HELPER FUNCTIONS
-- ========================================

-- Get current user ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM users WHERE supabase_user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has role in division
CREATE OR REPLACE FUNCTION user_has_division_role(
  p_user_id UUID,
  p_division_id UUID,
  p_role user_role
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_divisions
    WHERE user_id = p_user_id
    AND division_id = p_division_id
    AND role = p_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has project access
CREATE OR REPLACE FUNCTION user_has_project_access(
  p_user_id UUID,
  p_project_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_members
    WHERE user_id = p_user_id
    AND project_id = p_project_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PART 6: INITIAL DATA
-- ========================================

-- Insert the 5 MDM divisions
INSERT INTO divisions (name, code, description) VALUES
  ('MDM Group', 'GRP', 'Parent company and administrative division'),
  ('MDM Contracting', 'CON', 'General contracting and construction services'),
  ('MDM Homes', 'HOM', 'Residential construction and home building'),
  ('MDM Wood', 'WOD', 'Lumber supply and wood products'),
  ('MDM Telecom', 'TEL', 'Telecommunications infrastructure')
ON CONFLICT (name) DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Service role gets all permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'MDM Hub database schema created successfully!';
  RAISE NOTICE 'Tables created: users, divisions, user_divisions, projects, project_members, tasks, change_orders, photos, documents, notifications, audit_logs';
  RAISE NOTICE 'RLS policies applied to all tables';
  RAISE NOTICE '5 MDM divisions inserted';
END $$;
