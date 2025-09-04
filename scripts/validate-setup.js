#!/usr/bin/env node

/**
 * MDM Hub Setup Validation Script
 * 
 * This script validates the complete setup of MDM Hub including:
 * - Environment variables
 * - Supabase connection
 * - Azure AD configuration
 * - Basic functionality tests
 * 
 * Usage: npm run validate-setup
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions for colored output
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}`),
};

// Required environment variables
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_AZURE_CLIENT_ID',
  'NEXT_PUBLIC_AZURE_TENANT_ID',
  'NEXT_PUBLIC_AZURE_AUTHORITY',
  'NEXT_PUBLIC_AZURE_REDIRECT_URI',
];

// Optional environment variables
const OPTIONAL_ENV_VARS = [
  'NODE_ENV',
  'NEXT_PUBLIC_APP_URL',
];

/**
 * Load environment variables from .env files
 */
function loadEnvironmentVariables() {
  const envFiles = ['.env.local', '.env', '.env.production'];
  const envVars = {};

  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        }
      }
    }
  }

  // Also load from process.env
  Object.assign(envVars, process.env);
  
  return envVars;
}

/**
 * Validate environment variables
 */
function validateEnvironmentVariables(envVars) {
  log.step('🔍 Validating Environment Variables');
  
  const results = {
    valid: true,
    missing: [],
    configured: [],
    warnings: [],
  };

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    if (!envVars[varName]) {
      results.missing.push(varName);
      results.valid = false;
    } else {
      results.configured.push(varName);
    }
  }

  // Check optional variables
  for (const varName of OPTIONAL_ENV_VARS) {
    if (envVars[varName]) {
      results.configured.push(varName);
    }
  }

  // Display results
  if (results.missing.length > 0) {
    log.error(`Missing required environment variables: ${results.missing.join(', ')}`);
  }

  if (results.configured.length > 0) {
    log.success(`Configured variables: ${results.configured.length}`);
  }

  // Check for common issues
  if (envVars.NEXT_PUBLIC_SUPABASE_URL && !envVars.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    results.warnings.push('NEXT_PUBLIC_SUPABASE_URL should start with https://');
  }

  if (envVars.NEXT_PUBLIC_AZURE_AUTHORITY && !envVars.NEXT_PUBLIC_AZURE_AUTHORITY.includes('microsoftonline.com')) {
    results.warnings.push('NEXT_PUBLIC_AZURE_AUTHORITY should contain microsoftonline.com');
  }

  if (results.warnings.length > 0) {
    for (const warning of results.warnings) {
      log.warning(warning);
    }
  }

  return results;
}

/**
 * Test Supabase connection
 */
async function testSupabaseConnection(envVars) {
  log.step('🗄️ Testing Supabase Connection');
  
  if (!envVars.NEXT_PUBLIC_SUPABASE_URL || !envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    log.error('Cannot test Supabase connection - missing URL or key');
    return { valid: false, error: 'Missing Supabase configuration' };
  }

  try {
    const supabase = createClient(
      envVars.NEXT_PUBLIC_SUPABASE_URL,
      envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test basic connection
    log.info('Testing basic connection...');
    const { data, error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      log.error(`Supabase connection failed: ${error.message}`);
      return { valid: false, error: error.message };
    }

    log.success('Supabase connection successful');
    
    // Test auth functionality
    log.info('Testing authentication functionality...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      log.warning(`Auth session check failed: ${sessionError.message}`);
    } else {
      log.success('Authentication functionality working');
    }

    return { valid: true, data: data?.length || 0 };

  } catch (error) {
    log.error(`Supabase connection error: ${error.message}`);
    return { valid: false, error: error.message };
  }
}

/**
 * Validate Azure AD configuration
 */
function validateAzureConfiguration(envVars) {
  log.step('🔐 Validating Azure AD Configuration');
  
  const azureVars = [
    'NEXT_PUBLIC_AZURE_CLIENT_ID',
    'NEXT_PUBLIC_AZURE_TENANT_ID',
    'NEXT_PUBLIC_AZURE_AUTHORITY',
    'NEXT_PUBLIC_AZURE_REDIRECT_URI',
  ];

  const results = {
    valid: true,
    missing: [],
    configured: [],
    warnings: [],
  };

  for (const varName of azureVars) {
    if (!envVars[varName]) {
      results.missing.push(varName);
      results.valid = false;
    } else {
      results.configured.push(varName);
    }
  }

  // Validate format
  if (envVars.NEXT_PUBLIC_AZURE_CLIENT_ID && envVars.NEXT_PUBLIC_AZURE_CLIENT_ID.length < 36) {
    results.warnings.push('Azure Client ID seems too short (should be a GUID)');
  }

  if (envVars.NEXT_PUBLIC_AZURE_TENANT_ID && envVars.NEXT_PUBLIC_AZURE_TENANT_ID.length < 36) {
    results.warnings.push('Azure Tenant ID seems too short (should be a GUID)');
  }

  if (envVars.NEXT_PUBLIC_AZURE_AUTHORITY && !envVars.NEXT_PUBLIC_AZURE_AUTHORITY.includes('login.microsoftonline.com')) {
    results.warnings.push('Azure Authority URL should contain login.microsoftonline.com');
  }

  if (envVars.NEXT_PUBLIC_AZURE_REDIRECT_URI && !envVars.NEXT_PUBLIC_AZURE_REDIRECT_URI.startsWith('http')) {
    results.warnings.push('Azure Redirect URI should start with http:// or https://');
  }

  // Display results
  if (results.missing.length > 0) {
    log.error(`Missing Azure AD variables: ${results.missing.join(', ')}`);
  }

  if (results.configured.length > 0) {
    log.success(`Azure AD variables configured: ${results.configured.length}/${azureVars.length}`);
  }

  if (results.warnings.length > 0) {
    for (const warning of results.warnings) {
      log.warning(warning);
    }
  }

  return results;
}

/**
 * Test basic functionality
 */
async function testBasicFunctionality(envVars) {
  log.step('🧪 Testing Basic Functionality');
  
  const results = {
    valid: true,
    tests: [],
  };

  // Test 1: Environment file exists
  const envFiles = ['.env.local', '.env'];
  let envFileExists = false;
  
  for (const envFile of envFiles) {
    if (fs.existsSync(path.join(process.cwd(), envFile))) {
      envFileExists = true;
      break;
    }
  }

  results.tests.push({
    name: 'Environment file exists',
    passed: envFileExists,
  });

  if (envFileExists) {
    log.success('Environment file found');
  } else {
    log.warning('No environment file found (.env.local or .env)');
  }

  // Test 2: Package.json exists
  const packageJsonExists = fs.existsSync(path.join(process.cwd(), 'package.json'));
  results.tests.push({
    name: 'Package.json exists',
    passed: packageJsonExists,
  });

  if (packageJsonExists) {
    log.success('Package.json found');
  } else {
    log.error('Package.json not found');
    results.valid = false;
  }

  // Test 3: Next.js configuration
  const nextConfigExists = fs.existsSync(path.join(process.cwd(), 'next.config.js'));
  results.tests.push({
    name: 'Next.js configuration exists',
    passed: nextConfigExists,
  });

  if (nextConfigExists) {
    log.success('Next.js configuration found');
  } else {
    log.warning('Next.js configuration not found');
  }

  return results;
}

/**
 * Generate setup report
 */
function generateReport(envResults, supabaseResults, azureResults, functionalityResults) {
  log.header('📊 Setup Validation Report');
  
  const overallValid = envResults.valid && supabaseResults.valid && azureResults.valid && functionalityResults.valid;
  
  console.log(`\n${colors.bright}Overall Status: ${overallValid ? colors.green + 'VALID' : colors.red + 'INVALID'}${colors.reset}`);
  
  console.log('\n📋 Summary:');
  console.log(`  Environment Variables: ${envResults.valid ? colors.green + '✓' : colors.red + '✗'}${colors.reset} (${envResults.configured.length}/${REQUIRED_ENV_VARS.length} configured)`);
  console.log(`  Supabase Connection: ${supabaseResults.valid ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
  console.log(`  Azure AD Configuration: ${azureResults.valid ? colors.green + '✓' : colors.red + '✗'}${colors.reset} (${azureResults.configured.length}/4 configured)`);
  console.log(`  Basic Functionality: ${functionalityResults.valid ? colors.green + '✓' : colors.red + '✗'}${colors.reset} (${functionalityResults.tests.filter(t => t.passed).length}/${functionalityResults.tests.length} tests passed)`);

  if (!overallValid) {
    console.log(`\n${colors.red}${colors.bright}❌ Setup Issues Found:${colors.reset}`);
    
    if (!envResults.valid) {
      console.log(`  • Missing environment variables: ${envResults.missing.join(', ')}`);
    }
    
    if (!supabaseResults.valid) {
      console.log(`  • Supabase connection failed: ${supabaseResults.error}`);
    }
    
    if (!azureResults.valid) {
      console.log(`  • Azure AD configuration incomplete: ${azureResults.missing.join(', ')}`);
    }
    
    if (!functionalityResults.valid) {
      const failedTests = functionalityResults.tests.filter(t => !t.passed);
      console.log(`  • Failed functionality tests: ${failedTests.map(t => t.name).join(', ')}`);
    }

    console.log(`\n${colors.yellow}💡 Next Steps:${colors.reset}`);
    console.log('  1. Review the issues above');
    console.log('  2. Update your .env.local file with missing variables');
    console.log('  3. Restart your development server: npm run dev');
    console.log('  4. Run this validation script again: npm run validate-setup');
  } else {
    console.log(`\n${colors.green}${colors.bright}🎉 Setup Complete!${colors.reset}`);
    console.log('Your MDM Hub application is properly configured and ready to use.');
    console.log('\nNext steps:');
    console.log('  1. Start your development server: npm run dev');
    console.log('  2. Visit http://localhost:3000 to access your application');
    console.log('  3. Set up your database schema using the SQL files in the supabase/ directory');
  }
}

/**
 * Main validation function
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}🚀 MDM Hub Setup Validation${colors.reset}`);
  console.log('This script will validate your MDM Hub setup...\n');

  try {
    // Load environment variables
    const envVars = loadEnvironmentVariables();
    
    // Run all validations
    const envResults = validateEnvironmentVariables(envVars);
    const supabaseResults = await testSupabaseConnection(envVars);
    const azureResults = validateAzureConfiguration(envVars);
    const functionalityResults = await testBasicFunctionality(envVars);
    
    // Generate report
    generateReport(envResults, supabaseResults, azureResults, functionalityResults);
    
    // Exit with appropriate code
    const overallValid = envResults.valid && supabaseResults.valid && azureResults.valid && functionalityResults.valid;
    process.exit(overallValid ? 0 : 1);
    
  } catch (error) {
    log.error(`Validation failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the validation if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  validateEnvironmentVariables,
  testSupabaseConnection,
  validateAzureConfiguration,
  testBasicFunctionality,
};
