'use client';

import { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { AuthProviderWrapper } from '@/components/auth/auth-provider-wrapper';
import { ToastProvider } from '@/components/ui/toast-provider';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryProvider>
      <AuthProviderWrapper>
        <ToastProvider>{children}</ToastProvider>
      </AuthProviderWrapper>
    </QueryProvider>
  );
}
