/**
 * Development utilities for debugging and configuration validation
 *
 * This module provides comprehensive debugging tools for development mode only.
 * It helps developers identify configuration issues, test connections, and
 * provides helpful setup guidance.
 */

import { checkEnvironmentVariables, getEnvVarStatus } from './env-check';
import {
  getSupabaseConfigStatus,
  isSupabaseClientInitialized,
} from './supabase';

// Development mode check
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  details: {
    environment: {
      isValid: boolean;
      missingVars: string[];
      configuredVars: string[];
    };
    supabase: {
      isConfigured: boolean;
      isInitialized: boolean;
      hasUrl: boolean;
      hasAnonKey: boolean;
      errors: string[];
    };
    azure: {
      isConfigured: boolean;
      hasClientId: boolean;
      hasTenantId: boolean;
      hasAuthority: boolean;
      hasRedirectUri: boolean;
    };
  };
}

/**
 * Check all required environment variables
 */
export function checkAllEnvironmentVariables(): ConfigValidationResult {
  const envCheck = checkEnvironmentVariables();
  const envStatus = getEnvVarStatus();
  const supabaseStatus = getSupabaseConfigStatus();

  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Environment variable validation
  if (!envCheck.isValid) {
    errors.push(
      `Missing required environment variables: ${envCheck.missingVars.join(', ')}`
    );
  }

  // Supabase validation
  if (!supabaseStatus.isConfigured) {
    errors.push('Supabase is not properly configured');
  }

  if (!supabaseStatus.hasUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is missing');
  }

  if (!supabaseStatus.hasAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  }

  // Azure AD validation
  const azureVars = envStatus.filter(env => env.name.includes('AZURE'));
  const missingAzureVars = azureVars.filter(env => !env.isConfigured);

  if (missingAzureVars.length > 0) {
    warnings.push(
      `Azure AD configuration incomplete: ${missingAzureVars.map(v => v.name).join(', ')}`
    );
  }

  // Generate suggestions
  if (errors.length > 0) {
    suggestions.push('Visit /setup to configure missing environment variables');
  }

  if (warnings.length > 0) {
    suggestions.push(
      'Complete Azure AD configuration for full authentication support'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    details: {
      environment: {
        isValid: envCheck.isValid,
        missingVars: envCheck.missingVars,
        configuredVars: envStatus
          .filter(env => env.isConfigured)
          .map(env => env.name),
      },
      supabase: {
        isConfigured: supabaseStatus.isConfigured,
        isInitialized: isSupabaseClientInitialized(),
        hasUrl: supabaseStatus.hasUrl,
        hasAnonKey: supabaseStatus.hasAnonKey,
        errors: supabaseStatus.errors || [],
      },
      azure: {
        isConfigured: missingAzureVars.length === 0,
        hasClientId: !!process.env.NEXT_PUBLIC_AZURE_CLIENT_ID,
        hasTenantId: !!process.env.NEXT_PUBLIC_AZURE_TENANT_ID,
        hasAuthority: !!process.env.NEXT_PUBLIC_AZURE_AUTHORITY,
        hasRedirectUri: !!process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI,
      },
    },
  };
}

/**
 * Validate Supabase connection
 */
export async function validateSupabaseConnection(): Promise<{
  isValid: boolean;
  error?: string;
  details?: any;
}> {
  if (!isDevelopment) {
    return { isValid: true };
  }

  try {
    const { createBrowserSupabaseClient } = await import('./supabase');
    const supabase = createBrowserSupabaseClient();

    // Test basic connection using a valid table
    const { data, error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      return {
        isValid: false,
        error: error.message,
        details: error,
      };
    }

    return {
      isValid: true,
      details: { connection: 'successful', data: data?.length || 0 },
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error,
    };
  }
}

/**
 * Test Azure AD configuration
 */
export async function validateAzureConfiguration(): Promise<{
  isValid: boolean;
  error?: string;
  details?: any;
}> {
  if (!isDevelopment) {
    return { isValid: true };
  }

  try {
    const { signInWithAzure } = await import('./azure-auth');

    // This is a dry run - we don't actually sign in
    // We just check if the configuration is valid
    const config = {
      clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID,
      tenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID,
      authority: process.env.NEXT_PUBLIC_AZURE_AUTHORITY,
      redirectUri: process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI,
    };

    const missingConfig = Object.entries(config)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingConfig.length > 0) {
      return {
        isValid: false,
        error: `Missing Azure configuration: ${missingConfig.join(', ')}`,
        details: { missing: missingConfig },
      };
    }

    return {
      isValid: true,
      details: { configuration: 'complete' },
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error,
    };
  }
}

/**
 * Provide setup guidance based on current configuration
 */
export function getSetupGuidance(): {
  isSetupNeeded: boolean;
  steps: string[];
  priority: 'high' | 'medium' | 'low';
} {
  const validation = checkAllEnvironmentVariables();

  if (validation.isValid) {
    return {
      isSetupNeeded: false,
      steps: ['Configuration is complete!'],
      priority: 'low',
    };
  }

  const steps: string[] = [];
  let priority: 'high' | 'medium' | 'low' = 'low';

  // High priority: Missing environment variables
  if (validation.details.environment.missingVars.length > 0) {
    priority = 'high';
    steps.push('1. Configure missing environment variables:');
    validation.details.environment.missingVars.forEach(varName => {
      steps.push(`   - ${varName}`);
    });
    steps.push('2. Create a .env.local file with the required variables');
    steps.push('3. Restart your development server');
  }

  // Medium priority: Supabase issues
  if (!validation.details.supabase.isConfigured) {
    if (priority === 'low') priority = 'medium';
    steps.push('4. Verify your Supabase configuration');
    steps.push('5. Check your Supabase project URL and anonymous key');
  }

  // Low priority: Azure AD issues
  if (!validation.details.azure.isConfigured) {
    steps.push('6. Complete Azure AD configuration for SSO support');
    steps.push('7. Register your application in Azure Portal');
  }

  return {
    isSetupNeeded: true,
    steps,
    priority,
  };
}

/**
 * Show debugging information in development
 */
export function logDebugInfo(): void {
  if (!isDevelopment) return;

  console.group('🔧 MDM Hub Development Debug Info');

  const validation = checkAllEnvironmentVariables();

  console.log('📋 Configuration Status:', {
    isValid: validation.isValid,
    errors: validation.errors.length,
    warnings: validation.warnings.length,
  });

  console.log('🌍 Environment Variables:', validation.details.environment);
  console.log('🗄️ Supabase Status:', validation.details.supabase);
  console.log('🔐 Azure AD Status:', validation.details.azure);

  if (validation.errors.length > 0) {
    console.error('❌ Configuration Errors:', validation.errors);
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Configuration Warnings:', validation.warnings);
  }

  if (validation.suggestions.length > 0) {
    console.info('💡 Suggestions:', validation.suggestions);
  }

  const guidance = getSetupGuidance();
  if (guidance.isSetupNeeded) {
    console.log('📝 Setup Steps:', guidance.steps);
  }

  console.groupEnd();
}

/**
 * Comprehensive configuration test
 */
export async function runConfigurationTest(): Promise<{
  overall: boolean;
  results: {
    environment: boolean;
    supabase: boolean;
    azure: boolean;
  };
  details: any;
}> {
  if (!isDevelopment) {
    return {
      overall: true,
      results: { environment: true, supabase: true, azure: true },
      details: { mode: 'production' },
    };
  }

  console.log('🧪 Running configuration test...');

  const validation = checkAllEnvironmentVariables();
  const supabaseTest = await validateSupabaseConnection();
  const azureTest = await validateAzureConfiguration();

  const results = {
    environment: validation.isValid,
    supabase: supabaseTest.isValid,
    azure: azureTest.isValid,
  };

  const overall = Object.values(results).every(result => result);

  const details = {
    environment: validation,
    supabase: supabaseTest,
    azure: azureTest,
  };

  console.log('✅ Configuration test completed:', { overall, results });

  return { overall, results, details };
}

/**
 * Development mode initialization
 */
export function initializeDevelopmentMode(): void {
  if (!isDevelopment) return;

  // Log debug info on startup
  logDebugInfo();

  // Add global debug functions for console access
  if (typeof window !== 'undefined') {
    (window as any).__MDM_DEBUG__ = {
      checkConfig: checkAllEnvironmentVariables,
      testSupabase: validateSupabaseConnection,
      testAzure: validateAzureConfiguration,
      getGuidance: getSetupGuidance,
      runTest: runConfigurationTest,
      logDebug: logDebugInfo,
    };

    console.log(
      '🛠️ Development mode initialized. Use __MDM_DEBUG__ for debugging tools.'
    );
  }
}

/**
 * Helper function to check if setup is needed
 */
export function isSetupNeeded(): boolean {
  const validation = checkAllEnvironmentVariables();
  return !validation.isValid;
}

/**
 * Get helpful error messages for each configuration issue
 */
export function getConfigurationErrorMessages(): Record<string, string> {
  return {
    NEXT_PUBLIC_SUPABASE_URL:
      'Your Supabase project URL. Get this from your Supabase dashboard.',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      'Your Supabase anonymous key. Get this from your Supabase dashboard.',
    SUPABASE_SERVICE_ROLE_KEY:
      'Your Supabase service role key. Get this from your Supabase dashboard.',
    NEXT_PUBLIC_AZURE_CLIENT_ID:
      'Your Azure AD application client ID. Get this from Azure Portal.',
    NEXT_PUBLIC_AZURE_TENANT_ID:
      'Your Azure AD tenant ID. Get this from Azure Portal.',
    NEXT_PUBLIC_AZURE_AUTHORITY:
      'Your Azure AD authority URL. Usually https://login.microsoftonline.com/{tenant-id}',
    NEXT_PUBLIC_AZURE_REDIRECT_URI:
      'Your Azure AD redirect URI. Should match your app registration.',
  };
}
