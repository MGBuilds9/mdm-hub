# MDM Hub Database Setup Guide

This guide will help you set up the complete database schema for your MDM Hub application.

## 🚀 Quick Setup

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Complete Schema

1. Copy the entire contents of `supabase/complete-schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the schema

## 📋 What This Schema Creates

### Core Tables
- **users** - User profiles (extends Supabase auth.users)
- **divisions** - 5 MDM divisions (Group, Contracting, Homes, Wood, Telecom)
- **user_divisions** - Many-to-many relationship between users and divisions
- **projects** - Construction projects
- **project_members** - Project team members
- **tasks** - Project tasks
- **change_orders** - Project change orders
- **photos** - Project photos with metadata
- **documents** - Project documents with SharePoint integration
- **notifications** - User notifications
- **audit_logs** - Comprehensive audit trail

### Key Features
- ✅ **Row Level Security (RLS)** - Comprehensive security policies
- ✅ **Audit Logging** - Automatic tracking of all changes
- ✅ **Performance Indexes** - Optimized for fast queries
- ✅ **Enum Types** - Type-safe status and role management
- ✅ **Helper Functions** - Utility functions for common operations
- ✅ **Initial Data** - 5 MDM divisions pre-populated

## 🔐 Security Features

### Row Level Security Policies
- Users can only see data from their divisions
- Project members can only access their projects
- Managers have elevated permissions
- Service role bypass for admin operations
- Audit logs are service-role only

### User Roles
- **admin** - Full system access
- **manager** - Division/project management
- **supervisor** - Team supervision
- **worker** - Standard user
- **client** - External client access
- **subcontractor** - External contractor access

## 📊 Data Structure

### Divisions (Pre-populated)
1. **MDM Group** (GRP) - Parent company and administrative
2. **MDM Contracting** (CON) - General contracting and construction
3. **MDM Homes** (HOM) - Residential construction and home building
4. **MDM Wood** (WOD) - Lumber supply and wood products
5. **MDM Telecom** (TEL) - Telecommunications infrastructure

### Project Status Flow
- **planning** → **active** → **completed**
- **on_hold** (can be set at any time)
- **cancelled** (can be set at any time)

### Task Management
- **Priority levels**: low, medium, high, urgent
- **Status tracking**: pending → in_progress → review → completed
- **Time tracking**: estimated vs actual hours
- **Assignment system**: assigned_to, assigned_by tracking

## 🔧 Helper Functions

### Available Functions
- `get_current_user_id()` - Get current user's internal ID
- `user_has_division_role(user_id, division_id, role)` - Check division permissions
- `user_has_project_access(user_id, project_id)` - Check project access

### Usage Examples
```sql
-- Check if current user is a manager in division
SELECT user_has_division_role(
  get_current_user_id(), 
  'division-uuid', 
  'manager'::user_role
);

-- Check if user has access to a project
SELECT user_has_project_access(
  get_current_user_id(), 
  'project-uuid'
);
```

## 📸 File Management

### Photos Table
- **Storage**: Supabase Storage integration
- **Metadata**: EXIF data, GPS location, dimensions
- **Organization**: Project and task association
- **Tags**: Flexible tagging system

### Documents Table
- **Storage**: Supabase Storage + SharePoint integration
- **Versioning**: Built-in version tracking
- **Metadata**: File type, size, upload tracking
- **Organization**: Project association with tags

## 🔔 Notifications System

### Notification Types
- **info** - General information
- **warning** - Important notices
- **error** - Error alerts
- **success** - Success confirmations

### Features
- User-specific notifications
- Read/unread tracking
- Rich data payload support
- Automatic cleanup capabilities

## 📈 Performance Optimizations

### Indexes Created
- **User lookups**: email, supabase_user_id, role, is_active
- **Project queries**: division_id, status, manager_id, dates
- **Task management**: project_id, assigned_to, status, priority
- **Audit logs**: table_name, record_id, user_id, operation
- **Composite indexes**: user_divisions, project_members

### Query Optimization
- **Materialized views**: For complex reporting (can be added)
- **Partial indexes**: For active records only
- **Covering indexes**: For common query patterns

## 🚨 Important Notes

### Before Running
1. **Backup existing data** if you have any
2. **Test in development** first
3. **Verify environment variables** are set correctly

### After Running
1. **Check the success message** in the SQL output
2. **Verify RLS policies** are enabled
3. **Test user permissions** with different roles
4. **Update your application** to use the new schema

## 🔄 Migration from Old Schema

If you have an existing schema:

1. **Export existing data** (if needed)
2. **Drop old tables** (if safe to do so)
3. **Run the new schema**
4. **Import data** using the new structure
5. **Update application code** to match new types

## 🆘 Troubleshooting

### Common Issues
- **Permission errors**: Ensure service role has proper access
- **RLS blocking queries**: Check user context and policies
- **Type mismatches**: Update application types to match schema
- **Missing indexes**: Re-run the schema if indexes are missing

### Verification Queries
```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check divisions were created
SELECT name, code FROM divisions ORDER BY name;
```

## 📞 Support

If you encounter any issues:
1. Check the Supabase logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your Supabase project has the necessary permissions
4. Review the RLS policies if access is denied

---

**Success!** Once completed, your MDM Hub will have a robust, secure, and scalable database foundation ready for production use.
