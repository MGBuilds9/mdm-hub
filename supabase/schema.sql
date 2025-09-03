-- Construction Project Management App - PostgreSQL Schema
-- Multi-tenant system with 5 divisions and comprehensive project management

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE division_type AS ENUM ('Group', 'Contracting', 'Homes', 'Wood', 'Telecom');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'supervisor', 'worker', 'viewer');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on-hold', 'completed', 'cancelled');
CREATE TYPE change_order_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'implemented');
CREATE TYPE notification_type AS ENUM ('project_update', 'change_order', 'photo_upload', 'system_alert');
CREATE TYPE audit_action AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- Divisions table
CREATE TABLE divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name division_type UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_internal BOOLEAN DEFAULT FALSE,
    azure_ad_id VARCHAR(255) UNIQUE,
    supabase_user_id UUID UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User divisions junction table (many-to-many)
CREATE TABLE user_divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'viewer',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, division_id)
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE RESTRICT,
    project_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status project_status DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    location VARCHAR(255),
    client_name VARCHAR(255),
    client_contact VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project users junction table (many-to-many)
CREATE TABLE project_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'worker',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Photo gallery table
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    camera_make VARCHAR(100),
    camera_model VARCHAR(100),
    taken_at TIMESTAMP WITH TIME ZONE,
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    gps_altitude DECIMAL(8, 2),
    description TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Change orders table
CREATE TABLE change_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reason TEXT,
    estimated_cost DECIMAL(15,2),
    estimated_hours INTEGER,
    status change_order_status DEFAULT 'draft',
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Change order attachments
CREATE TABLE change_order_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    change_order_id UUID NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Audit trail table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action audit_action NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for performance
CREATE INDEX idx_user_divisions_user_id ON user_divisions(user_id);
CREATE INDEX idx_user_divisions_division_id ON user_divisions(division_id);
CREATE INDEX idx_projects_division_id ON projects(division_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_manager ON projects(project_manager_id);
CREATE INDEX idx_project_users_project_id ON project_users(project_id);
CREATE INDEX idx_project_users_user_id ON project_users(user_id);
CREATE INDEX idx_photos_project_id ON photos(project_id);
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by);
CREATE INDEX idx_photos_taken_at ON photos(taken_at);
CREATE INDEX idx_change_orders_project_id ON change_orders(project_id);
CREATE INDEX idx_change_orders_status ON change_orders(status);
CREATE INDEX idx_change_orders_created_by ON change_orders(created_by);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), current_setting('app.current_user_id', true)::UUID);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_setting('app.current_user_id', true)::UUID);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), current_setting('app.current_user_id', true)::UUID);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON divisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_change_orders_updated_at BEFORE UPDATE ON change_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit triggers
CREATE TRIGGER audit_divisions AFTER INSERT OR UPDATE OR DELETE ON divisions FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_user_divisions AFTER INSERT OR UPDATE OR DELETE ON user_divisions FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_project_users AFTER INSERT OR UPDATE OR DELETE ON project_users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_photos AFTER INSERT OR UPDATE OR DELETE ON photos FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_change_orders AFTER INSERT OR UPDATE OR DELETE ON change_orders FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_change_order_attachments AFTER INSERT OR UPDATE OR DELETE ON change_order_attachments FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Enable Row Level Security
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_order_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for divisions
CREATE POLICY "Users can view divisions they belong to" ON divisions
    FOR SELECT USING (
        id IN (
            SELECT division_id FROM user_divisions 
            WHERE user_id = current_setting('app.current_user_id', true)::UUID
        )
    );

CREATE POLICY "Admins can manage divisions" ON divisions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_divisions 
            WHERE user_id = current_setting('app.current_user_id', true)::UUID 
            AND division_id = divisions.id 
            AND role = 'admin'
        )
    );

-- RLS Policies for users
CREATE POLICY "Users can view users in their divisions" ON users
    FOR SELECT USING (
        id IN (
            SELECT DISTINCT u.id FROM users u
            JOIN user_divisions ud1 ON u.id = ud1.user_id
            JOIN user_divisions ud2 ON ud1.division_id = ud2.division_id
            WHERE ud2.user_id = current_setting('app.current_user_id', true)::UUID
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = current_setting('app.current_user_id', true)::UUID);

-- RLS Policies for user_divisions
CREATE POLICY "Users can view divisions they belong to" ON user_divisions
    FOR SELECT USING (
        user_id = current_setting('app.current_user_id', true)::UUID
        OR division_id IN (
            SELECT division_id FROM user_divisions 
            WHERE user_id = current_setting('app.current_user_id', true)::UUID 
            AND role IN ('admin', 'manager')
        )
    );

-- RLS Policies for projects
CREATE POLICY "Users can view projects in their divisions" ON projects
    FOR SELECT USING (
        division_id IN (
            SELECT division_id FROM user_divisions 
            WHERE user_id = current_setting('app.current_user_id', true)::UUID
        )
    );

CREATE POLICY "Managers can manage projects in their divisions" ON projects
    FOR ALL USING (
        division_id IN (
            SELECT division_id FROM user_divisions 
            WHERE user_id = current_setting('app.current_user_id', true)::UUID 
            AND role IN ('admin', 'manager')
        )
    );

-- RLS Policies for project_users
CREATE POLICY "Users can view project assignments in their divisions" ON project_users
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN user_divisions ud ON p.division_id = ud.division_id
            WHERE ud.user_id = current_setting('app.current_user_id', true)::UUID
        )
    );

-- RLS Policies for photos
CREATE POLICY "Users can view photos from projects in their divisions" ON photos
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN user_divisions ud ON p.division_id = ud.division_id
            WHERE ud.user_id = current_setting('app.current_user_id', true)::UUID
        )
    );

CREATE POLICY "Users can upload photos to assigned projects" ON photos
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT project_id FROM project_users 
            WHERE user_id = current_setting('app.current_user_id', true)::UUID
        )
    );

-- RLS Policies for change_orders
CREATE POLICY "Users can view change orders from projects in their divisions" ON change_orders
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN user_divisions ud ON p.division_id = ud.division_id
            WHERE ud.user_id = current_setting('app.current_user_id', true)::UUID
        )
    );

CREATE POLICY "Users can create change orders for assigned projects" ON change_orders
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT project_id FROM project_users 
            WHERE user_id = current_setting('app.current_user_id', true)::UUID
        )
    );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', true)::UUID);

-- RLS Policies for audit_log
CREATE POLICY "Admins can view audit logs" ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_divisions 
            WHERE user_id = current_setting('app.current_user_id', true)::UUID 
            AND role = 'admin'
        )
    );

-- Insert sample data
INSERT INTO divisions (name, display_name, description) VALUES
('Group', 'MDM Group', 'Main corporate division'),
('Contracting', 'MDM Contracting', 'General contracting services'),
('Homes', 'MDM Homes', 'Residential construction'),
('Wood', 'MDM Wood', 'Wood construction and carpentry'),
('Telecom', 'MDM Telecom', 'Telecommunications infrastructure');

-- Insert sample users
INSERT INTO users (email, first_name, last_name, phone, is_internal) VALUES
('admin@mdmgroup.com', 'John', 'Admin', '+1-555-0101', true),
('manager@mdmgroup.com', 'Jane', 'Manager', '+1-555-0102', true),
('supervisor@mdmgroup.com', 'Bob', 'Supervisor', '+1-555-0103', true),
('worker@mdmgroup.com', 'Alice', 'Worker', '+1-555-0104', true),
('client@example.com', 'Client', 'User', '+1-555-0105', false);

-- Insert sample user divisions
INSERT INTO user_divisions (user_id, division_id, role, is_primary) VALUES
((SELECT id FROM users WHERE email = 'admin@mdmgroup.com'), (SELECT id FROM divisions WHERE name = 'Group'), 'admin', true),
((SELECT id FROM users WHERE email = 'manager@mdmgroup.com'), (SELECT id FROM divisions WHERE name = 'Contracting'), 'manager', true),
((SELECT id FROM users WHERE email = 'supervisor@mdmgroup.com'), (SELECT id FROM divisions WHERE name = 'Homes'), 'supervisor', true),
((SELECT id FROM users WHERE email = 'worker@mdmgroup.com'), (SELECT id FROM divisions WHERE name = 'Wood'), 'worker', true);

-- Insert sample projects
INSERT INTO projects (name, description, division_id, project_manager_id, status, start_date, end_date, budget, location, client_name) VALUES
('Office Building Construction', 'New 5-story office building', (SELECT id FROM divisions WHERE name = 'Contracting'), (SELECT id FROM users WHERE email = 'manager@mdmgroup.com'), 'active', '2024-01-01', '2024-12-31', 5000000.00, 'Downtown', 'ABC Corp'),
('Residential Development', '50-unit residential complex', (SELECT id FROM divisions WHERE name = 'Homes'), (SELECT id FROM users WHERE email = 'supervisor@mdmgroup.com'), 'planning', '2024-03-01', '2025-06-30', 15000000.00, 'Suburb', 'XYZ Developers'),
('Wood Frame House', 'Custom wood frame construction', (SELECT id FROM divisions WHERE name = 'Wood'), (SELECT id FROM users WHERE email = 'worker@mdmgroup.com'), 'active', '2024-02-01', '2024-08-31', 750000.00, 'Rural', 'Smith Family');

-- Insert sample project users
INSERT INTO project_users (project_id, user_id, role) VALUES
((SELECT id FROM projects WHERE name = 'Office Building Construction'), (SELECT id FROM users WHERE email = 'manager@mdmgroup.com'), 'manager'),
((SELECT id FROM projects WHERE name = 'Office Building Construction'), (SELECT id FROM users WHERE email = 'supervisor@mdmgroup.com'), 'supervisor'),
((SELECT id FROM projects WHERE name = 'Residential Development'), (SELECT id FROM users WHERE email = 'supervisor@mdmgroup.com'), 'supervisor'),
((SELECT id FROM projects WHERE name = 'Wood Frame House'), (SELECT id FROM users WHERE email = 'worker@mdmgroup.com'), 'worker');

-- Create function to set current user context
CREATE OR REPLACE FUNCTION set_current_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::TEXT, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user divisions
CREATE OR REPLACE FUNCTION get_user_divisions(user_id UUID)
RETURNS TABLE(division_id UUID, division_name division_type, role user_role, is_primary BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT ud.division_id, d.name, ud.role, ud.is_primary
    FROM user_divisions ud
    JOIN divisions d ON ud.division_id = d.id
    WHERE ud.user_id = get_user_divisions.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check user access to project
CREATE OR REPLACE FUNCTION user_has_project_access(user_id UUID, project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM projects p
        JOIN user_divisions ud ON p.division_id = ud.division_id
        WHERE p.id = user_has_project_access.project_id
        AND ud.user_id = user_has_project_access.user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
