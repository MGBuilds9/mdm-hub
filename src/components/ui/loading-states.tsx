'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/loading';
import {
  Database,
  Shield,
  Settings,
  User,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

interface LoadingStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  progress?: number;
  status?: 'loading' | 'success' | 'error' | 'warning';
  details?: string | undefined;
  showProgress?: boolean;
}

/**
 * Generic loading state component
 */
export function LoadingState({
  title,
  description,
  icon,
  progress = 0,
  status = 'loading',
  details,
  showProgress = false,
}: LoadingStateProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      default:
        return (
          icon || <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card className={`${getStatusColor()} transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">{getStatusIcon()}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
            {details && <p className="text-xs text-gray-500 mt-2">{details}</p>}
            {showProgress && status === 'loading' && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * App initialization loading state
 */
export function AppInitializationLoading({
  progress = 0,
  status = 'loading',
  details,
}: {
  progress?: number;
  status?: 'loading' | 'success' | 'error';
  details?: string;
}) {
  return (
    <LoadingState
      title="Initializing Application"
      description="Setting up the application environment and loading core services..."
      icon={<Settings className="h-6 w-6 text-blue-500" />}
      progress={progress}
      status={status}
      details={details}
      showProgress={true}
    />
  );
}

/**
 * Authentication setup loading state
 */
export function AuthenticationSetupLoading({
  progress = 0,
  status = 'loading',
  details,
}: {
  progress?: number;
  status?: 'loading' | 'success' | 'error';
  details?: string;
}) {
  return (
    <LoadingState
      title="Setting Up Authentication"
      description="Configuring authentication providers and security settings..."
      icon={<Shield className="h-6 w-6 text-blue-500" />}
      progress={progress}
      status={status}
      details={details}
      showProgress={true}
    />
  );
}

/**
 * Environment configuration loading state
 */
export function EnvironmentConfigLoading({
  progress = 0,
  status = 'loading',
  details,
}: {
  progress?: number;
  status?: 'loading' | 'success' | 'error' | 'warning';
  details?: string;
}) {
  return (
    <LoadingState
      title="Validating Environment Configuration"
      description="Checking environment variables and configuration settings..."
      icon={<Settings className="h-6 w-6 text-blue-500" />}
      progress={progress}
      status={status}
      details={details}
      showProgress={true}
    />
  );
}

/**
 * Database connection loading state
 */
export function DatabaseConnectionLoading({
  progress = 0,
  status = 'loading',
  details,
}: {
  progress?: number;
  status?: 'loading' | 'success' | 'error';
  details?: string;
}) {
  return (
    <LoadingState
      title="Connecting to Database"
      description="Establishing connection to Supabase and validating schema..."
      icon={<Database className="h-6 w-6 text-blue-500" />}
      progress={progress}
      status={status}
      details={details}
      showProgress={true}
    />
  );
}

/**
 * User profile loading state
 */
export function UserProfileLoading({
  progress = 0,
  status = 'loading',
  details,
}: {
  progress?: number;
  status?: 'loading' | 'success' | 'error';
  details?: string;
}) {
  return (
    <LoadingState
      title="Loading User Profile"
      description="Fetching user information and permissions..."
      icon={<User className="h-6 w-6 text-blue-500" />}
      progress={progress}
      status={status}
      details={details}
      showProgress={true}
    />
  );
}

/**
 * Full page loading state for setup
 */
export function SetupPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Setting Up MDM Hub
          </h1>
          <p className="text-gray-600">
            We're preparing your application environment...
          </p>
        </div>

        <div className="space-y-4">
          <AppInitializationLoading progress={25} />
          <EnvironmentConfigLoading progress={50} />
          <DatabaseConnectionLoading progress={75} />
          <AuthenticationSetupLoading progress={90} />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            This may take a few moments depending on your configuration
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline loading state for components
 */
export function InlineLoading({
  message = 'Loading...',
  size = 'sm',
}: {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center space-x-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
}

/**
 * Skeleton loading for content areas
 */
export function ContentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Card skeleton loading
 */
export function CardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Table skeleton loading
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}
