'use client';

import { useAuth } from '@/contexts/auth-context';
import { ServerDashboard } from './server-dashboard';
import { LoginForm } from '@/components/auth/login-form';
import { Loading } from '@/components/ui/loading';

export function ClientDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginForm />;
  }

  return <ServerDashboard />;
}
