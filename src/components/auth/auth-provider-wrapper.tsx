'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { AuthErrorBoundary } from './auth-error-boundary';
import { AuthGuard } from './auth-guard';

interface AuthProviderWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

/**
 * AuthProviderWrapper component that provides the complete authentication flow.
 *
 * Structure:
 * - AuthErrorBoundary (catches auth-related errors)
 *   - AuthProvider (provides auth context)
 *     - AuthGuard (handles loading/error states and auth requirements)
 *       - children
 */
export function AuthProviderWrapper({
  children,
  requireAuth = true,
  fallback,
}: AuthProviderWrapperProps) {
  return (
    <AuthErrorBoundary>
      <AuthProvider>
        <AuthGuard requireAuth={requireAuth} fallback={fallback}>
          {children}
        </AuthGuard>
      </AuthProvider>
    </AuthErrorBoundary>
  );
}
