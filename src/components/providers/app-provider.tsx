'use client';

import { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { AuthProviderWrapper } from '@/components/auth/auth-provider-wrapper';
import { ToastProvider } from '@/components/ui/toast-provider';
import { ErrorBoundary, ErrorType } from '@/components/error-boundary';

interface AppProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
}

/**
 * AppProvider component that provides the complete application context.
 *
 * Provider nesting order (outermost to innermost):
 * 1. ErrorBoundary - Catches any unhandled errors
 * 2. QueryProvider - Provides React Query context
 * 3. AuthProviderWrapper - Provides authentication context with error handling
 * 4. ToastProvider - Provides toast notifications
 * 5. Children - Application components
 */
export function AppProvider({
  children,
  requireAuth = false,
}: AppProviderProps) {
  return (
    <ErrorBoundary
      errorType={ErrorType.UNKNOWN}
      showDetails={process.env.NODE_ENV === 'development'}
      allowRetry={true}
    >
      <QueryProvider>
        <AuthProviderWrapper requireAuth={requireAuth}>
          <ToastProvider>{children}</ToastProvider>
        </AuthProviderWrapper>
      </QueryProvider>
    </ErrorBoundary>
  );
}
