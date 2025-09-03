'use client';

import React from 'react';
import { Skeleton, SkeletonCard } from '@/components/ui/loading';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface AuthLoadingSkeletonProps {
  variant?: 'page' | 'card' | 'minimal';
  showUserInfo?: boolean;
  showNavigation?: boolean;
}

export function AuthLoadingSkeleton({ 
  variant = 'page', 
  showUserInfo = true,
  showNavigation = true 
}: AuthLoadingSkeletonProps) {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default page variant
  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && (
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="flex items-center space-x-4">
                {showUserInfo && (
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                )}
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            
            {/* Content grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface AuthInitializationSkeletonProps {
  message?: string;
}

export function AuthInitializationSkeleton({ 
  message = 'Initializing authentication...' 
}: AuthInitializationSkeletonProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="space-y-2">
          <p className="text-gray-600 font-medium">{message}</p>
          <p className="text-sm text-gray-500">
            This may take a few moments...
          </p>
        </div>
      </div>
    </div>
  );
}

interface AuthRetrySkeletonProps {
  retryCount: number;
  maxRetries: number;
  message?: string;
}

export function AuthRetrySkeleton({ 
  retryCount, 
  maxRetries, 
  message = 'Retrying authentication...' 
}: AuthRetrySkeletonProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 h-12 w-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="space-y-2">
          <p className="text-gray-600 font-medium">{message}</p>
          <p className="text-sm text-gray-500">
            Attempt {retryCount} of {maxRetries}
          </p>
          <div className="w-48 bg-gray-200 rounded-full h-2 mx-auto">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(retryCount / maxRetries) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
