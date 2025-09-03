-- Fix RLS policies to allow user profile creation
-- Run this in your Supabase SQL editor

-- Add policy to allow users to insert their own profile
CREATE POLICY "Users can create their own profile" ON users
    FOR INSERT WITH CHECK (
        supabase_user_id = auth.uid()
    );

-- Add policy to allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (
        supabase_user_id = auth.uid()
    );

-- Add policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (
        supabase_user_id = auth.uid()
    );

-- Also add a policy to allow service role to manage users (for admin operations)
CREATE POLICY "Service role can manage all users" ON users
    FOR ALL USING (
        auth.role() = 'service_role'
    );
