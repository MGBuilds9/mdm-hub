'use client';

import { ReactNode } from 'react';
import { MainLayout } from '@/components/layout/main-layout';

interface ClientGenericProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ClientGeneric({
  title,
  description,
  children,
}: ClientGenericProps) {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-950">{title}</h1>
          <p className="text-charcoal-600 mt-2">{description}</p>
        </div>
        {children}
      </div>
    </MainLayout>
  );
}
