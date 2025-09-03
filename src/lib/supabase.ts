/**
 * Client-side Supabase configuration
 *
 * This file provides the Supabase client instances for client-side usage only.
 * Server-side operations are handled in supabase-server.ts
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';
import { checkEnvironmentVariables, shouldRedirectToSetup } from './env-check';
// Environment validation is handled by the config service

// Environment variable validation
const envCheck = checkEnvironmentVariables();

// Handle missing environment variables
if (!envCheck.isValid) {
  if (shouldRedirectToSetup()) {
    if (typeof window !== 'undefined') {
      // Client-side: redirect to setup page
      window.location.href = '/setup';
    } else {
      // Server-side: throw error to prevent initialization
      throw new Error(
        `Missing required environment variables: ${envCheck.missingVars.join(', ')}. Please visit /setup to configure your environment.`
      );
    }
  } else {
    // Production: throw error immediately
    throw new Error(
      `Missing required environment variables: ${envCheck.missingVars.join(', ')}`
    );
  }
}

// Safe to access environment variables now
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Lazy initialization flag
let clientInstance: SupabaseClient<Database> | null = null;

/**
 * Creates a Supabase client for browser usage with lazy initialization
 * This client respects RLS policies and should be used for user operations
 */
export function createBrowserSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is incomplete');
  }

  // Return cached instance if available
  if (clientInstance) {
    return clientInstance;
  }

  // Create new instance
  clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return clientInstance;
}

// Export the client instance for backward compatibility
export const supabase = createBrowserSupabaseClient();

/**
 * Get Supabase configuration status
 */
export function getSupabaseConfigStatus() {
  return {
    isConfigured: envCheck.isValid,
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    errors: envCheck.errors,
    warnings: envCheck.warnings,
  };
}

/**
 * Reset client instance (useful for testing)
 */
export function resetSupabaseClient() {
  clientInstance = null;
}

// Helper function to set user context for RLS
export const setUserContext = async (userId: string) => {
  const client = createBrowserSupabaseClient();
  const { error } = await client.rpc('set_current_user', {
    user_id: userId,
  });

  if (error) {
    console.error('Error setting user context:', error);
    throw error;
  }
};

// Helper function to get user divisions
export const getUserDivisions = async (userId: string) => {
  const client = createBrowserSupabaseClient();
  const { data, error } = await client.rpc('get_user_divisions', {
    user_id: userId,
  });

  if (error) {
    console.error('Error getting user divisions:', error);
    throw error;
  }

  return data;
};

// Helper function to check project access
export const checkProjectAccess = async (userId: string, projectId: string) => {
  const client = createBrowserSupabaseClient();
  const { data, error } = await client.rpc('user_has_project_access', {
    user_id: userId,
    project_id: projectId,
  });

  if (error) {
    console.error('Error checking project access:', error);
    throw error;
  }

  return data;
};

// Debug Supabase connection (only in development with valid env vars)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', supabaseUrl);
  console.log(
    'Supabase Key (first 10 chars):',
    supabaseAnonKey?.substring(0, 10) + '...'
  );
}
