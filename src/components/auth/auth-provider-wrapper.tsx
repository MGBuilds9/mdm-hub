'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { AuthErrorBoundary } from './auth-error-boundary';
import { 
  AuthLoadingSkeleton, 
  AuthInitializationSkeleton, 
  AuthRetrySkeleton 
} from './auth-loading-skeleton';
import { useAuth } from '@/contexts/auth-context';

interface AuthProviderWrapperProps {
  children: React.ReactNode;
}

function AuthContent({ children }: { children: React.ReactNode }) {
  const { loading, error, isRetrying, retryCount } = useAuth();

  // Show retry skeleton if retrying
  if (isRetrying) {
    return (
      <AuthRetrySkeleton 
        retryCount={retryCount} 
        maxRetries={3}
        message="Retrying authentication..."
      />
    );
  }

  // Show initialization skeleton if loading
  if (loading) {
    return (
      <AuthInitializationSkeleton 
        message="Initializing authentication..."
      />
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-red-600">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Authentication Error</h3>
            <p className="text-sm text-gray-500 mt-1">
              {error.message || 'An unexpected error occurred during authentication.'}
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render children if everything is working
  return <>{children}</>;
}

export function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  return (
    <AuthErrorBoundary>
      <AuthProvider>
        <AuthContent>
          {children}
        </AuthContent>
      </AuthProvider>
    </AuthErrorBoundary>
  );
}
