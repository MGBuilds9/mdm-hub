/**
 * Comprehensive environment variable validation script
 * This script validates all required environment variables at startup
 */

import {
  checkEnvironmentVariables,
  REQUIRED_ENV_VARS,
  type EnvCheckResult,
} from './env-check';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingVars: string[];
  configuredVars: string[];
}

/**
 * Validate environment variables with detailed reporting
 */
export function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    missingVars: [],
    configuredVars: [],
  };

  // Check basic environment variables
  const envCheck = checkEnvironmentVariables();

  if (!envCheck.isValid) {
    result.isValid = false;
    result.errors.push(...envCheck.errors);
    result.missingVars.push(...envCheck.missingVars);
  }

  // Check each variable individually for detailed reporting
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar.name];

    if (value) {
      result.configuredVars.push(envVar.name);

      // Validate specific formats
      if (envVar.name === 'NEXT_PUBLIC_SUPABASE_URL') {
        if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
          result.warnings.push(`Invalid Supabase URL format: ${envVar.name}`);
        }
      }

      if (envVar.name.includes('SUPABASE') && envVar.name.includes('KEY')) {
        if (!value.startsWith('eyJ')) {
          result.warnings.push(`Invalid JWT token format: ${envVar.name}`);
        }
      }

      if (envVar.name === 'NEXT_PUBLIC_AZURE_AUTHORITY') {
        if (!value.startsWith('https://login.microsoftonline.com/')) {
          result.warnings.push(
            `Invalid Azure authority URL format: ${envVar.name}`
          );
        }
      }

      if (envVar.name === 'NEXT_PUBLIC_AZURE_REDIRECT_URI') {
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
          result.warnings.push(`Invalid redirect URI format: ${envVar.name}`);
        }
      }

      if (envVar.name === 'NEXT_PUBLIC_AZURE_TENANT_ID') {
        // Azure tenant ID should be a GUID
        const guidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!guidRegex.test(value)) {
          result.warnings.push(
            `Invalid Azure tenant ID format: ${envVar.name}`
          );
        }
      }

      if (envVar.name === 'NEXT_PUBLIC_AZURE_CLIENT_ID') {
        // Azure client ID should be a GUID
        const guidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!guidRegex.test(value)) {
          result.warnings.push(
            `Invalid Azure client ID format: ${envVar.name}`
          );
        }
      }
    } else {
      result.missingVars.push(envVar.name);
    }
  }

  // Check for development vs production environment
  if (process.env.NODE_ENV === 'development') {
    if (result.missingVars.length > 0) {
      result.warnings.push(
        'Development mode: Missing environment variables will redirect to /setup'
      );
    }
  } else {
    if (result.missingVars.length > 0) {
      result.isValid = false;
      result.errors.push(
        'Production mode: All environment variables must be configured'
      );
    }
  }

  return result;
}

/**
 * Log validation results to console
 */
export function logValidationResults(result: ValidationResult): void {
  console.log('🔍 Environment Variable Validation Results:');
  console.log('==========================================');

  if (result.isValid) {
    console.log('✅ All required environment variables are configured');
  } else {
    console.log('❌ Environment validation failed');
  }

  if (result.configuredVars.length > 0) {
    console.log(`\n✅ Configured variables (${result.configuredVars.length}):`);
    result.configuredVars.forEach(varName => {
      console.log(`   • ${varName}`);
    });
  }

  if (result.missingVars.length > 0) {
    console.log(`\n❌ Missing variables (${result.missingVars.length}):`);
    result.missingVars.forEach(varName => {
      const envVar = REQUIRED_ENV_VARS.find(v => v.name === varName);
      console.log(`   • ${varName} - ${envVar?.description || 'Required'}`);
    });
  }

  if (result.errors.length > 0) {
    console.log(`\n🚨 Errors (${result.errors.length}):`);
    result.errors.forEach(error => {
      console.log(`   • ${error}`);
    });
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
    result.warnings.forEach(warning => {
      console.log(`   • ${warning}`);
    });
  }

  console.log('\n==========================================');
}

// Cache validation result to prevent multiple runs
let validationCache: { isValid: boolean; result?: ValidationResult } | null =
  null;

/**
 * Validate environment and throw error if invalid
 */
export function validateEnvironmentOrThrow(): void {
  // Return cached result if available
  if (validationCache) {
    if (!validationCache.isValid) {
      throw new Error('Environment validation failed (cached result)');
    }
    return;
  }

  const result = validateEnvironment();

  // Cache the result
  validationCache = { isValid: result.isValid, result };

  // Log results only once
  logValidationResults(result);

  // Throw error if invalid
  if (!result.isValid) {
    const errorMessage = `Environment validation failed:\n${result.errors.join('\n')}`;
    throw new Error(errorMessage);
  }

  // Log warnings if any
  if (result.warnings.length > 0) {
    console.warn(
      'Environment validation completed with warnings. Please review the configuration.'
    );
  }
}

/**
 * Get environment status for UI display
 */
export function getEnvironmentStatus() {
  const result = validateEnvironment();

  return {
    isValid: result.isValid,
    totalVars: REQUIRED_ENV_VARS.length,
    configuredVars: result.configuredVars.length,
    missingVars: result.missingVars.length,
    errors: result.errors,
    warnings: result.warnings,
    details: REQUIRED_ENV_VARS.map(envVar => ({
      name: envVar.name,
      description: envVar.description,
      isConfigured: result.configuredVars.includes(envVar.name),
      value: process.env[envVar.name] ? '***configured***' : undefined,
    })),
  };
}

// Auto-validate on import in development
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  try {
    const result = validateEnvironment();
    if (!result.isValid) {
      console.warn(
        '⚠️  Environment validation failed. Some features may not work correctly.'
      );
      console.warn('Visit /setup to configure missing environment variables.');
    }
  } catch (error) {
    console.error('❌ Environment validation error:', error);
  }
}
