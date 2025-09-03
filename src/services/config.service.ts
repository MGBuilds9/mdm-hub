/**
 * Configuration Service
 * 
 * Centralizes environment variable validation, typed configuration objects,
 * feature flags, and runtime configuration management.
 */

import { telemetry } from '@/lib/telemetry';

// Environment variable validation result
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Feature flags configuration
export interface FeatureFlags {
  azureAuth: boolean;
  supabaseAuth: boolean;
  emailAuth: boolean;
  socialAuth: boolean;
  analytics: boolean;
  telemetry: boolean;
  debugMode: boolean;
}

// Supabase configuration
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  enabled: boolean;
}

// Azure AD configuration
export interface AzureConfig {
  clientId: string;
  tenantId: string;
  authority: string;
  redirectUri: string;
  enabled: boolean;
}

// Database configuration
export interface DatabaseConfig {
  url: string;
  enabled: boolean;
}

// Application configuration
export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  baseUrl: string;
  apiUrl: string;
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

// Complete configuration object
export interface Configuration {
  app: AppConfig;
  supabase: SupabaseConfig;
  azure: AzureConfig;
  database: DatabaseConfig;
  features: FeatureFlags;
  validation: ConfigValidationResult;
}

// Configuration validation errors
export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public errors: string[],
    public warnings: string[] = []
  ) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

// Configuration service class
class ConfigService {
  private config: Configuration | null = null;
  private validationPromise: Promise<Configuration> | null = null;

  /**
   * Validates all environment variables and returns typed configuration
   */
  async validateAndGetConfig(): Promise<Configuration> {
    // Return cached config if already validated
    if (this.config) {
      return this.config;
    }

    // Return existing validation promise if in progress
    if (this.validationPromise) {
      return this.validationPromise;
    }

    // Start new validation
    this.validationPromise = this.performValidation();
    
    try {
      this.config = await this.validationPromise;
      return this.config;
    } catch (error) {
      this.validationPromise = null;
      throw error;
    }
  }

  /**
   * Performs the actual validation
   */
  private async performValidation(): Promise<Configuration> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required environment variables
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      errors.push(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Validate Azure AD configuration
    const azureVars = [
      'NEXT_PUBLIC_AZURE_CLIENT_ID',
      'NEXT_PUBLIC_AZURE_TENANT_ID',
      'NEXT_PUBLIC_AZURE_AUTHORITY',
      'NEXT_PUBLIC_AZURE_REDIRECT_URI',
    ];

    const missingAzureVars = azureVars.filter(varName => !process.env[varName]);
    if (missingAzureVars.length > 0) {
      warnings.push(`Azure AD not fully configured: ${missingAzureVars.join(', ')}`);
    }

    // Validate URL formats
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !this.isValidUrl(supabaseUrl)) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
    }

    const azureAuthority = process.env.NEXT_PUBLIC_AZURE_AUTHORITY;
    if (azureAuthority && !this.isValidUrl(azureAuthority)) {
      errors.push('NEXT_PUBLIC_AZURE_AUTHORITY is not a valid URL');
    }

    const azureRedirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI;
    if (azureRedirectUri && !this.isValidUrl(azureRedirectUri)) {
      errors.push('NEXT_PUBLIC_AZURE_REDIRECT_URI is not a valid URL');
    }

    // Check for development vs production configuration
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // Production-specific validations
      if (process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI?.includes('localhost')) {
        errors.push('Azure redirect URI cannot use localhost in production');
      }
    }

    // Build configuration objects
    const appConfig: AppConfig = {
      environment: (process.env.NODE_ENV as any) || 'development',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
      apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
      debugMode: isDevelopment || process.env.NEXT_PUBLIC_DEBUG === 'true',
      logLevel: (process.env.LOG_LEVEL as any) || (isDevelopment ? 'debug' : 'error'),
    };

    const supabaseConfig: SupabaseConfig = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      enabled: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    };

    const azureConfig: AzureConfig = {
      clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
      tenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID || '',
      authority: process.env.NEXT_PUBLIC_AZURE_AUTHORITY || '',
      redirectUri: process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || '',
      enabled: !!(process.env.NEXT_PUBLIC_AZURE_CLIENT_ID && 
                  process.env.NEXT_PUBLIC_AZURE_TENANT_ID && 
                  process.env.NEXT_PUBLIC_AZURE_AUTHORITY && 
                  process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI),
    };

    const databaseConfig: DatabaseConfig = {
      url: process.env.DATABASE_URL || '',
      enabled: !!process.env.DATABASE_URL,
    };

    const features: FeatureFlags = {
      azureAuth: azureConfig.enabled,
      supabaseAuth: supabaseConfig.enabled,
      emailAuth: supabaseConfig.enabled, // Email auth requires Supabase
      socialAuth: azureConfig.enabled || supabaseConfig.enabled,
      analytics: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
      telemetry: process.env.NEXT_PUBLIC_TELEMETRY_ENABLED !== 'false', // Default to true
      debugMode: appConfig.debugMode,
    };

    const validation: ConfigValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
    };

    // Track configuration validation
    telemetry.track({
      event: 'config_validation',
      properties: {
        isValid: validation.isValid,
        errorCount: errors.length,
        warningCount: warnings.length,
        features: features,
        environment: appConfig.environment,
      },
    });

    // Throw error if validation fails
    if (!validation.isValid) {
      const error = new ConfigValidationError(
        'Configuration validation failed',
        errors,
        warnings
      );
      
      telemetry.trackError(error, 'config_validation_failed');
      throw error;
    }

    // Log warnings in development
    if (warnings.length > 0 && isDevelopment) {
      console.warn('Configuration warnings:', warnings);
    }

    return {
      app: appConfig,
      supabase: supabaseConfig,
      azure: azureConfig,
      database: databaseConfig,
      features,
      validation,
    };
  }

  /**
   * Validates URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets cached configuration (throws if not validated)
   */
  getConfig(): Configuration {
    if (!this.config) {
      throw new Error('Configuration not validated. Call validateAndGetConfig() first.');
    }
    return this.config;
  }

  /**
   * Checks if a feature is enabled
   */
  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    const config = this.getConfig();
    return config.features[feature];
  }

  /**
   * Gets Supabase configuration
   */
  getSupabaseConfig(): SupabaseConfig {
    return this.getConfig().supabase;
  }

  /**
   * Gets Azure configuration
   */
  getAzureConfig(): AzureConfig {
    return this.getConfig().azure;
  }

  /**
   * Gets app configuration
   */
  getAppConfig(): AppConfig {
    return this.getConfig().app;
  }

  /**
   * Gets feature flags
   */
  getFeatureFlags(): FeatureFlags {
    return this.getConfig().features;
  }

  /**
   * Validates configuration at runtime
   */
  validateRuntime(): ConfigValidationResult {
    const config = this.getConfig();
    return config.validation;
  }

  /**
   * Resets configuration (for testing)
   */
  reset(): void {
    this.config = null;
    this.validationPromise = null;
  }
}

// Singleton instance
export const configService = new ConfigService();

// Convenience functions
export const validateConfig = () => configService.validateAndGetConfig();
export const getConfig = () => configService.getConfig();
export const isFeatureEnabled = (feature: keyof FeatureFlags) => configService.isFeatureEnabled(feature);
export const getSupabaseConfig = () => configService.getSupabaseConfig();
export const getAzureConfig = () => configService.getAzureConfig();
export const getAppConfig = () => configService.getAppConfig();
export const getFeatureFlags = () => configService.getFeatureFlags();
export const validateRuntime = () => configService.validateRuntime();

// React hook for configuration
export function useConfig() {
  const [config, setConfig] = React.useState<Configuration | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const validatedConfig = await configService.validateAndGetConfig();
        setConfig(validatedConfig);
      } catch (err) {
        setError(err as Error);
        telemetry.trackError(err as Error, 'useConfig_hook');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return {
    config,
    loading,
    error,
    isFeatureEnabled: (feature: keyof FeatureFlags) => config?.features[feature] ?? false,
    refresh: async () => {
      configService.reset();
      const validatedConfig = await configService.validateAndGetConfig();
      setConfig(validatedConfig);
    },
  };
}

// Import React for the hook
import React from 'react';
