'use client';

import React from 'react';
import { AuthGuard } from './auth-guard';

interface AuthenticatedPageProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component for pages that require authentication.
 * This component should be used inside the AuthProvider context.
 */
export function AuthenticatedPage({
  children,
  fallback,
}: AuthenticatedPageProps) {
  return (
    <AuthGuard requireAuth={true} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}
