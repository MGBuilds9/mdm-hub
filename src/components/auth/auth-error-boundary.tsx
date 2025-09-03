'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { telemetry } from '@/lib/telemetry';

interface AuthErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function AuthErrorFallback({ error, resetError }: AuthErrorFallbackProps) {
  const handleRetry = () => {
    telemetry.trackError(error, 'auth_error_boundary_retry');
    resetError();
  };

  const handleReload = () => {
    telemetry.trackError(error, 'auth_error_boundary_reload');
    window.location.reload();
  };

  const handleGoToLogin = () => {
    telemetry.trackError(error, 'auth_error_boundary_login');
    window.location.href = '/login';
  };

  // Determine if this is a network/connection error
  const isNetworkError =
    error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('connection') ||
    error.message.toLowerCase().includes('fetch');

  const isAuthError =
    error.message.toLowerCase().includes('auth') ||
    error.message.toLowerCase().includes('jwt') ||
    error.message.toLowerCase().includes('token');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-900">
            {isNetworkError
              ? 'Connection Error'
              : isAuthError
                ? 'Authentication Error'
                : 'Authentication Failed'}
          </CardTitle>
          <CardDescription>
            {isNetworkError
              ? 'Unable to connect to the authentication service. Please check your internet connection.'
              : isAuthError
                ? 'There was a problem with your authentication session. Please sign in again.'
                : 'An unexpected error occurred during authentication. Please try again.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <details className="rounded-md bg-gray-50 p-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                {error.message}
                {error.stack && (
                  <>
                    {'\n\n'}
                    {error.stack}
                  </>
                )}
              </pre>
            </details>
          )}

          <div className="space-y-2">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            {isAuthError && (
              <Button
                variant="outline"
                onClick={handleGoToLogin}
                className="w-full"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In Again
              </Button>
            )}

            <Button variant="outline" onClick={handleReload} className="w-full">
              Reload Page
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              If this problem persists, please contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<AuthErrorFallbackProps>;
}

export function AuthErrorBoundary({
  children,
  fallback,
}: AuthErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    telemetry.trackError(error, 'auth_error_boundary', {
      componentStack: errorInfo.componentStack,
    });
  };

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={fallback || AuthErrorFallback}
    >
      {children}
    </ErrorBoundary>
  );
}
