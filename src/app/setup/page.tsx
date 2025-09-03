'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/alert';
import { CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react';
import { getEnvVarStatus, generateEnvFileTemplate } from '@/lib/env-check';
import { ConfigStatus } from '@/components/config/config-status';

export default function SetupPage() {
  const [envVars, setEnvVars] = useState<ReturnType<typeof getEnvVarStatus>>(
    []
  );
  const [isClient, setIsClient] = useState(false);

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
            Environment Setup Required
          </h1>
          <p className="text-lg text-gray-600">
            Configure your environment variables to get started
          </p>
        </div>

        {/* Configuration Status */}
        <div className="mb-8">
          <ConfigStatus />
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Environment Variables Status
            </h2>
            <div className="space-y-3">
              {envVars.map(envVar => (
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
                    </p>
                    <p className="text-sm text-gray-500">
                      {envVar.description}
                    </p>
                    {envVar.value && (
                      <p className="text-xs text-gray-400 mt-1">
                        Value: {envVar.value.substring(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Setup Instructions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Setup Instructions
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  1. Create a Supabase Project
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  If you haven't already, create a new project at Supabase:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open('https://supabase.com/dashboard', '_blank')
                  }
                  className="mb-2"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Supabase Dashboard
                </Button>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  2. Get Your API Keys
                </h3>
                <p className="text-sm text-gray-600">
                  In your Supabase project dashboard, go to Settings → API to
                  find your:
                </p>
                <ul className="text-sm text-gray-600 mt-1 ml-4 list-disc">
                  <li>Project URL</li>
                  <li>Anonymous key (public)</li>
                  <li>Service role key (secret)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  3. Create Environment File
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Create a{' '}
                  <code className="bg-gray-100 px-1 rounded">.env.local</code>{' '}
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
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  4. Restart Development Server
                </h3>
                <p className="text-sm text-gray-600">
                  After creating the environment file, restart your development
                  server:
                </p>
                <div className="bg-gray-900 text-gray-100 p-2 rounded text-xs mt-1 font-mono">
                  npm run dev
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
