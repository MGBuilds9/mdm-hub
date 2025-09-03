/**
 * Server-side Supabase utilities
 * 
 * This file contains server-only Supabase functions that use the service role key.
 * These functions should NEVER be used in client-side code.
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Build-time check to ensure this file is not bundled in client code
if (typeof window !== 'undefined') {
  throw new Error('supabase-server.ts should never be imported in client-side code');
}

// Validate that service role key is available
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}

/**
 * Creates a Supabase client with service role key for server-side operations
 * This bypasses RLS and should only be used for administrative operations
 */
export function createServiceClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Creates a server-side Supabase client with user session
 * This respects RLS policies and should be used for user operations
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  return createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options });
      },
    },
  });
}

/**
 * Server action to get user session
 */
export async function getServerSession() {
  'use server';
  
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting server session:', error);
      return { session: null, error };
    }
    
    return { session, error: null };
  } catch (error) {
    console.error('Error in getServerSession:', error);
    return { session: null, error: error as Error };
  }
}

/**
 * Server action to sign out user
 */
export async function signOutServer() {
  'use server';
  
  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in signOutServer:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Server action to refresh user session
 */
export async function refreshServerSession() {
  'use server';
  
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      return { session: null, error };
    }
    
    return { session, error: null };
  } catch (error) {
    console.error('Error in refreshServerSession:', error);
    return { session: null, error: error as Error };
  }
}

/**
 * Server action to get user profile with proper RLS
 */
export async function getUserProfileServer(userId: string) {
  'use server';
  
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error getting user profile:', error);
      return { profile: null, error };
    }
    
    return { profile: data, error: null };
  } catch (error) {
    console.error('Error in getUserProfileServer:', error);
    return { profile: null, error: error as Error };
  }
}

/**
 * Server action to update user profile with proper RLS
 */
export async function updateUserProfileServer(userId: string, updates: any) {
  'use server';
  
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return { profile: null, error };
    }
    
    return { profile: data, error: null };
  } catch (error) {
    console.error('Error in updateUserProfileServer:', error);
    return { profile: null, error: error as Error };
  }
}

/**
 * Administrative function to create user profile (uses service role)
 * This should only be used in server-side contexts like API routes
 */
export async function createUserProfileAdmin(userData: any) {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile (admin):', error);
      return { profile: null, error };
    }
    
    return { profile: data, error: null };
  } catch (error) {
    console.error('Error in createUserProfileAdmin:', error);
    return { profile: null, error: error as Error };
  }
}

/**
 * Administrative function to get all users (uses service role)
 * This should only be used in server-side contexts like API routes
 */
export async function getAllUsersAdmin() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error getting all users (admin):', error);
      return { users: null, error };
    }
    
    return { users: data, error: null };
  } catch (error) {
    console.error('Error in getAllUsersAdmin:', error);
    return { users: null, error: error as Error };
  }
}

/**
 * Health check function for server-side Supabase connection
 */
export async function checkServerSupabaseHealth() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      return {
        healthy: false,
        error: error.message,
        responseTime: 0,
      };
    }
    
    return {
      healthy: true,
      error: null,
      responseTime: 0, // Could add timing logic here
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: 0,
    };
  }
}
