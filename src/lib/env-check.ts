/**
 * Environment variable validation utilities
 */

export interface EnvVarConfig {
  name: string;
  required: boolean;
  description: string;
}

export const REQUIRED_ENV_VARS: EnvVarConfig[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Your Supabase project URL'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Your Supabase anonymous key'
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Your Supabase service role key'
  },
  {
    name: 'NEXT_PUBLIC_AZURE_CLIENT_ID',
    required: true,
    description: 'Your Azure Active Directory client ID'
  },
  {
    name: 'NEXT_PUBLIC_AZURE_TENANT_ID',
    required: true,
    description: 'Your Azure Active Directory tenant ID'
  },
  {
    name: 'NEXT_PUBLIC_AZURE_AUTHORITY',
    required: true,
    description: 'Your Azure Active Directory authority URL'
  },
  {
    name: 'NEXT_PUBLIC_AZURE_REDIRECT_URI',
    required: true,
    description: 'Your Azure Active Directory redirect URI'
  }
];

export interface EnvCheckResult {
  isValid: boolean;
  missingVars: string[];
  errors: string[];
}

/**
 * Check if all required environment variables are present
 */
export function checkEnvironmentVariables(): EnvCheckResult {
  const missingVars: string[] = [];
  const errors: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (envVar.required && !process.env[envVar.name]) {
      missingVars.push(envVar.name);
      errors.push(`Missing required environment variable: ${envVar.name}`);
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    errors
  };
}

/**
 * Get environment variable status for display
 */
export function getEnvVarStatus() {
  return REQUIRED_ENV_VARS.map(envVar => ({
    name: envVar.name,
    value: process.env[envVar.name],
    required: envVar.required,
    description: envVar.description,
    isConfigured: !!process.env[envVar.name]
  }));
}

/**
 * Check if we should redirect to setup page
 */
export function shouldRedirectToSetup(): boolean {
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }

  const result = checkEnvironmentVariables();
  return !result.isValid;
}

/**
 * Generate environment file template
 */
export function generateEnvFileTemplate(): string {
  const supabaseVars = REQUIRED_ENV_VARS.filter(envVar => 
    envVar.name.includes('SUPABASE')
  );
  const azureVars = REQUIRED_ENV_VARS.filter(envVar => 
    envVar.name.includes('AZURE')
  );

  const supabaseTemplate = supabaseVars.map(envVar => {
    const exampleValue = envVar.name.includes('URL') 
      ? 'https://your-project-id.supabase.co'
      : envVar.name.includes('SERVICE_ROLE')
      ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    
    return `${envVar.name}=${exampleValue}`;
  }).join('\n');

  const azureTemplate = azureVars.map(envVar => {
    const exampleValue = envVar.name.includes('CLIENT_ID')
      ? '[YOUR_AZURE_CLIENT_ID]'
      : envVar.name.includes('TENANT_ID')
      ? '[YOUR_AZURE_TENANT_ID]'
      : envVar.name.includes('AUTHORITY')
      ? 'https://login.microsoftonline.com/[YOUR_TENANT_ID]'
      : envVar.name.includes('REDIRECT_URI')
      ? 'http://localhost:3000/auth/callback'
      : '[YOUR_VALUE]';
    
    return `${envVar.name}=${exampleValue}`;
  }).join('\n');

  return `# Supabase Configuration
# Get these values from your Supabase project dashboard: https://supabase.com/dashboard
${supabaseTemplate}

# Azure Active Directory Configuration
# Get these values from your Azure App Registration: https://portal.azure.com
${azureTemplate}

# Instructions:
# 1. Copy this file to .env.local
# 2. Replace the placeholder values with your actual credentials
# 3. For production, update the redirect URI to your production domain
# 4. Restart your development server: npm run dev`;
}
