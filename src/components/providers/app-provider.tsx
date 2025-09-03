'use client';

import { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { SupabaseProvider } from './supabase-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { ToastProvider } from '@/components/ui/toast-provider';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryProvider>
      <SupabaseProvider>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </SupabaseProvider>
    </QueryProvider>
  );
}
