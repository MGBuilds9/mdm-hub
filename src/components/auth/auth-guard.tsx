'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  AuthInitializationSkeleton,
  AuthRetrySkeleton,
} from './auth-loading-skeleton';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * AuthGuard component that handles authentication states and renders children
 * only when authentication is properly initialized.
 *
 * This component should be used INSIDE the AuthProvider context.
 */
export function AuthGuard({
  children,
  fallback,
  requireAuth = true,
}: AuthGuardProps) {
  const { loading, error, isRetrying, retryCount, retryAuth, user } = useAuth();

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
      <AuthInitializationSkeleton message="Initializing authentication..." />
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-600">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Authentication Error
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {error.message ||
                'An unexpected error occurred during authentication.'}
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => retryAuth()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-2"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If requireAuth is true but no user is authenticated, show fallback or redirect
  if (requireAuth) {
    if (!user) {
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default fallback - redirect to login or show login form
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-blue-600">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Authentication Required
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Please sign in to access this page.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => (window.location.href = '/auth/login')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Render children if everything is working
  return <>{children}</>;
}

/**
 * Higher-order component that wraps a component with AuthGuard
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

/**
 * Hook to check if user is authenticated (for use inside AuthProvider)
 */
export function useAuthGuard() {
  const { user, loading, error } = useAuth();

  return {
    isAuthenticated: !!user,
    isLoading: loading,
    hasError: !!error,
    user,
  };
}
