import * as React from 'react';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    divisions: string[];
  };
  onLogout?: () => void;
  className?: string;
}

export function MainLayout({
  children,
  user,
  onLogout,
  className,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background-50">
      {user && onLogout && <Sidebar user={user} onLogout={onLogout} />}

      {/* Main content */}
      <div className="lg:pl-64">
        <main className={cn('min-h-screen', className)}>{children}</main>
      </div>
    </div>
  );
}
