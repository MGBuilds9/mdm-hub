'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Database,
  Shield,
  Settings,
  ArrowRight,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { getEnvVarStatus, generateEnvFileTemplate } from '@/lib/env-check';
import { ConfigStatus } from '@/components/config/config-status';
import {
  EnvironmentConfigLoading,
  DatabaseConnectionLoading,
  AuthenticationSetupLoading,
  InlineLoading,
} from '@/components/ui/loading-states';
import {
  checkAllEnvironmentVariables,
  validateSupabaseConnection,
  validateAzureConfiguration,
  getSetupGuidance,
  getConfigurationErrorMessages,
} from '@/lib/dev-utils';

interface ValidationState {
  environment: 'idle' | 'loading' | 'success' | 'error';
  supabase: 'idle' | 'loading' | 'success' | 'error';
  azure: 'idle' | 'loading' | 'success' | 'error';
}

export default function SetupPage() {
  const [envVars, setEnvVars] = useState<ReturnType<typeof getEnvVarStatus>>(
    []
  );
  const [isClient, setIsClient] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>({
    environment: 'idle',
    supabase: 'idle',
    azure: 'idle',
  });
  const [validationResults, setValidationResults] = useState<{
    environment?: any;
    supabase?: any;
    azure?: any;
  }>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setEnvVars(getEnvVarStatus());
  }, []);

  const missingVars = envVars.filter(env => env.required && !env.value);
  const allConfigured = missingVars.length === 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const envFileContent = generateEnvFileTemplate();

  // Validation functions
  const validateEnvironment = async () => {
    setValidationState(prev => ({ ...prev, environment: 'loading' }));
    try {
      const result = checkAllEnvironmentVariables();
      setValidationResults(prev => ({ ...prev, environment: result }));
      setValidationState(prev => ({
        ...prev,
        environment: result.isValid ? 'success' : 'error',
      }));
      return result;
    } catch (error) {
      setValidationState(prev => ({ ...prev, environment: 'error' }));
      throw error;
    }
  };

  const validateSupabase = async () => {
    setValidationState(prev => ({ ...prev, supabase: 'loading' }));
    try {
      const result = await validateSupabaseConnection();
      setValidationResults(prev => ({ ...prev, supabase: result }));
      setValidationState(prev => ({
        ...prev,
        supabase: result.isValid ? 'success' : 'error',
      }));
      return result;
    } catch (error) {
      setValidationState(prev => ({ ...prev, supabase: 'error' }));
      throw error;
    }
  };

  const validateAzure = async () => {
    setValidationState(prev => ({ ...prev, azure: 'loading' }));
    try {
      const result = await validateAzureConfiguration();
      setValidationResults(prev => ({ ...prev, azure: result }));
      setValidationState(prev => ({
        ...prev,
        azure: result.isValid ? 'success' : 'error',
      }));
      return result;
    } catch (error) {
      setValidationState(prev => ({ ...prev, azure: 'error' }));
      throw error;
    }
  };

  const runFullValidation = async () => {
    setIsValidating(true);
    setCurrentStep(0);

    try {
      // Step 1: Environment validation
      setCurrentStep(1);
      await validateEnvironment();

      // Step 2: Supabase validation
      setCurrentStep(2);
      await validateSupabase();

      // Step 3: Azure validation
      setCurrentStep(3);
      await validateAzure();

      setCurrentStep(4);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const refreshEnvironmentVars = () => {
    setEnvVars(getEnvVarStatus());
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            MDM Hub Setup & Configuration
          </h1>
          <p className="text-lg text-gray-600">
            Complete your environment setup to get started with MDM Hub
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { id: 1, name: 'Environment', icon: Settings },
              { id: 2, name: 'Database', icon: Database },
              { id: 3, name: 'Authentication', icon: Shield },
              { id: 4, name: 'Complete', icon: Check },
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      isActive || isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.name}
                  </span>
                  {index < 3 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuration Status */}
        <div className="mb-8">
          <ConfigStatus />
        </div>

        {/* Validation Section */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Configuration Validation
              </h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshEnvironmentVars}
                  disabled={isValidating}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={runFullValidation}
                  disabled={isValidating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isValidating ? (
                    <InlineLoading message="Validating..." />
                  ) : (
                    'Validate Configuration'
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <EnvironmentConfigLoading
                progress={validationState.environment === 'loading' ? 50 : 100}
                status={
                  validationState.environment === 'idle'
                    ? 'loading'
                    : validationState.environment
                }
                details={
                  validationResults.environment?.errors?.length > 0
                    ? validationResults.environment.errors.join(', ')
                    : validationResults.environment?.isValid
                      ? 'All environment variables are configured'
                      : undefined
                }
              />

              <DatabaseConnectionLoading
                progress={validationState.supabase === 'loading' ? 50 : 100}
                status={
                  validationState.supabase === 'idle'
                    ? 'loading'
                    : validationState.supabase
                }
                details={
                  validationResults.supabase?.error ||
                  (validationResults.supabase?.isValid
                    ? 'Database connection successful'
                    : undefined)
                }
              />

              <AuthenticationSetupLoading
                progress={validationState.azure === 'loading' ? 50 : 100}
                status={
                  validationState.azure === 'idle'
                    ? 'loading'
                    : validationState.azure
                }
                details={
                  validationResults.azure?.error ||
                  (validationResults.azure?.isValid
                    ? 'Azure AD configuration valid'
                    : undefined)
                }
              />
            </div>
          </Card>
        </div>

        {allConfigured ? (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Configuration Complete!
              </h3>
              <p className="mt-1 text-sm text-green-700">
                All required environment variables are configured. You can now
                use the application.
              </p>
            </div>
          </Alert>
        ) : (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Missing Configuration
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {missingVars.length} required environment variable
                {missingVars.length > 1 ? 's' : ''}{' '}
                {missingVars.length > 1 ? 'are' : 'is'} missing.
              </p>
            </div>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Environment Variables Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Environment Variables Status
              </h2>
              <div className="text-sm text-gray-500">
                {envVars.filter(v => v.value).length} / {envVars.length}{' '}
                configured
              </div>
            </div>
            <div className="space-y-3">
              {envVars.map(envVar => {
                const errorMessages = getConfigurationErrorMessages();
                const helpText = errorMessages[envVar.name];

                return (
                  <div key={envVar.name} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {envVar.value ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {envVar.name}
                        {envVar.required && (
                          <span className="ml-2 text-xs text-red-500">*</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {envVar.description}
                      </p>
                      {helpText && (
                        <p className="text-xs text-blue-600 mt-1">
                          💡 {helpText}
                        </p>
                      )}
                      {envVar.value && (
                        <p className="text-xs text-gray-400 mt-1">
                          Value: {envVar.value.substring(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Setup Instructions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Step-by-Step Setup Guide
            </h2>
            <div className="space-y-6">
              {/* Step 1: Supabase Setup */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <span className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    1
                  </span>
                  Create a Supabase Project
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  If you haven't already, create a new project at Supabase:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open('https://supabase.com/dashboard', '_blank')
                  }
                  className="mb-3"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Supabase Dashboard
                </Button>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Tip:</strong> Choose a region close to your users
                    for better performance.
                  </p>
                </div>
              </div>

              {/* Step 2: Get API Keys */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <span className="bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    2
                  </span>
                  Get Your API Keys
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  In your Supabase project dashboard, go to{' '}
                  <strong>Settings → API</strong> to find:
                </p>
                <ul className="text-sm text-gray-600 mb-3 ml-4 list-disc space-y-1">
                  <li>
                    <strong>Project URL</strong> - Your Supabase project URL
                  </li>
                  <li>
                    <strong>Anonymous key</strong> - Public key for client-side
                    operations
                  </li>
                  <li>
                    <strong>Service role key</strong> - Secret key for
                    server-side operations
                  </li>
                </ul>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Security:</strong> Never expose your service role
                    key in client-side code!
                  </p>
                </div>
              </div>

              {/* Step 3: Environment File */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <span className="bg-purple-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    3
                  </span>
                  Create Environment File
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Create a{' '}
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    .env.local
                  </code>{' '}
                  file in your project root:
                </p>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {envFileContent}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(envFileContent)}
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                  <p className="text-xs text-green-800">
                    <strong>Pro tip:</strong> Replace the placeholder values
                    with your actual credentials from Step 2.
                  </p>
                </div>
              </div>

              {/* Step 4: Restart Server */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <span className="bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    4
                  </span>
                  Restart Development Server
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  After creating the environment file, restart your development
                  server:
                </p>
                <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono">
                  npm run dev
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                  <p className="text-xs text-blue-800">
                    <strong>Next:</strong> Click "Validate Configuration" above
                    to test your setup!
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Database Setup */}
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Database Setup
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              After configuring your environment variables, you'll need to set
              up your database schema.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Next Steps:
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>
                  • Run the SQL schema from{' '}
                  <code className="bg-yellow-100 px-1 rounded">
                    supabase/schema.sql
                  </code>
                </li>
                <li>
                  • Execute the user profile creation script:{' '}
                  <code className="bg-yellow-100 px-1 rounded">
                    create-user-profile.sql
                  </code>
                </li>
                <li>
                  • Apply RLS policies:{' '}
                  <code className="bg-yellow-100 px-1 rounded">
                    fix-rls-policies.sql
                  </code>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {allConfigured && (
          <div className="mt-6 text-center">
            <Button
              onClick={() => (window.location.href = '/')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Application
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
