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

// Lazy initialization flag
let clientInstance: SupabaseClient<Database> | null = null;
let initializationError: Error | null = null;

/**
 * Validates environment variables and returns configuration status
 */
function validateEnvironment(): {
  isValid: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  error?: Error;
} {
  try {
    const envCheck = checkEnvironmentVariables();

    if (!envCheck.isValid) {
      const errorMessage = `Missing required environment variables: ${envCheck.missingVars.join(', ')}`;

      if (shouldRedirectToSetup()) {
        // In development, we'll handle this gracefully
        return {
          isValid: false,
          error: new Error(
            errorMessage +
              '. Please visit /setup to configure your environment.'
          ),
        };
      } else {
        // In production, throw immediately
        return {
          isValid: false,
          error: new Error(errorMessage),
        };
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        isValid: false,
        error: new Error('Supabase configuration is incomplete'),
      };
    }

    return {
      isValid: true,
      supabaseUrl,
      supabaseAnonKey,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error as Error,
    };
  }
}

/**
 * Creates a Supabase client for browser usage with lazy initialization
 * This client respects RLS policies and should be used for user operations
 */
export function createBrowserSupabaseClient(): SupabaseClient<Database> {
  // Return cached instance if available
  if (clientInstance) {
    return clientInstance;
  }

  // Return cached error if initialization previously failed
  if (initializationError) {
    throw initializationError;
  }

  try {
    const config = validateEnvironment();

    if (!config.isValid || !config.supabaseUrl || !config.supabaseAnonKey) {
      initializationError =
        config.error || new Error('Supabase configuration is incomplete');
      throw initializationError;
    }

    // Create new instance
    clientInstance = createClient<Database>(
      config.supabaseUrl,
      config.supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }
    );

    return clientInstance;
  } catch (error) {
    initializationError = error as Error;
    throw error;
  }
}

/**
 * Lazy initialization of the Supabase client
 * This function will only create the client when first accessed
 */
function getSupabaseClient(): SupabaseClient<Database> {
  return createBrowserSupabaseClient();
}

// Export the client instance for backward compatibility
// This will trigger lazy initialization when first imported
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    const client = getSupabaseClient();
    return client[prop as keyof SupabaseClient<Database>];
  },
});

/**
 * Get Supabase configuration status
 */
export function getSupabaseConfigStatus() {
  const config = validateEnvironment();
  const envCheck = checkEnvironmentVariables();

  return {
    isConfigured: config.isValid,
    hasUrl: !!config.supabaseUrl,
    hasAnonKey: !!config.supabaseAnonKey,
    errors: envCheck.errors,
    warnings: envCheck.warnings,
    initializationError: initializationError?.message,
  };
}

/**
 * Reset client instance (useful for testing)
 */
export function resetSupabaseClient() {
  clientInstance = null;
  initializationError = null;
}

/**
 * Check if Supabase client is properly initialized
 */
export function isSupabaseClientInitialized(): boolean {
  return clientInstance !== null;
}

/**
 * Get initialization error if any
 */
export function getInitializationError(): Error | null {
  return initializationError;
}

// Helper function to get user divisions
export const getUserDivisions = async (userId: string) => {
  try {
    const client = createBrowserSupabaseClient();
    const { data, error } = await client
      .from('user_divisions')
      .select(
        `
        *,
        division:divisions(*)
      `
      )
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user divisions:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserDivisions:', error);
    throw error;
  }
};

// Helper function to check project access
export const checkProjectAccess = async (userId: string, projectId: string) => {
  try {
    const client = createBrowserSupabaseClient();
    const { data, error } = await client.rpc('user_has_project_access', {
      p_user_id: userId,
      p_project_id: projectId,
    });

    if (error) {
      console.error('Error checking project access:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in checkProjectAccess:', error);
    throw error;
  }
};

// Debug Supabase connection (only in development with valid env vars)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  try {
    const config = validateEnvironment();
    if (config.isValid) {
      console.log('Supabase URL:', config.supabaseUrl);
      console.log(
        'Supabase Key (first 10 chars):',
        config.supabaseAnonKey?.substring(0, 10) + '...'
      );
    } else {
      console.warn('Supabase not configured:', config.error?.message);
    }
  } catch (error) {
    console.warn('Supabase configuration check failed:', error);
  }
}
