'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/Badge';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Mail,
  Bug,
  Shield,
  Database,
  Globe,
  User,
} from 'lucide-react';
import { telemetry } from '@/lib/telemetry';

// Error types for different categories
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  DATABASE = 'database',
  NETWORK = 'network',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error boundary props
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  errorType?: ErrorType;
  showDetails?: boolean;
  allowRetry?: boolean;
}

// Error boundary state
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
}

// Error details interface
interface ErrorDetails {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string | undefined;
  componentStack?: string | undefined;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string | undefined;
}

/**
 * Comprehensive Error Boundary Component
 *
 * Features:
 * - Catches and logs authentication errors
 * - Provides user-friendly error messages
 * - Offers recovery actions (retry, contact support)
 * - Integrates with error tracking service
 * - Implements different boundaries for auth vs app errors
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, errorType } = this.props;

    this.setState({
      error,
      errorInfo,
    });

    // Log error details
    const errorDetails = this.getErrorDetails(error, errorInfo, errorType);
    this.logError(errorDetails);

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }
  }

  override componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private getErrorDetails(
    error: Error,
    errorInfo: ErrorInfo,
    errorType?: ErrorType
  ): ErrorDetails {
    const detectedType = this.detectErrorType(error, errorType);
    const severity = this.determineSeverity(error, detectedType);

    return {
      type: detectedType,
      severity,
      message: error.message,
      stack: error.stack ?? undefined,
      componentStack: errorInfo.componentStack ?? undefined,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userId: this.getCurrentUserId(),
    };
  }

  private detectErrorType(error: Error, providedType?: ErrorType): ErrorType {
    if (providedType) {
      return providedType;
    }

    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Authentication errors
    if (
      message.includes('auth') ||
      message.includes('login') ||
      message.includes('session')
    ) {
      return ErrorType.AUTHENTICATION;
    }

    // Database errors
    if (
      message.includes('database') ||
      message.includes('sql') ||
      message.includes('supabase')
    ) {
      return ErrorType.DATABASE;
    }

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout')
    ) {
      return ErrorType.NETWORK;
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required')
    ) {
      return ErrorType.VALIDATION;
    }

    // Permission errors
    if (
      message.includes('permission') ||
      message.includes('unauthorized') ||
      message.includes('forbidden')
    ) {
      return ErrorType.PERMISSION;
    }

    return ErrorType.UNKNOWN;
  }

  private determineSeverity(error: Error, type: ErrorType): ErrorSeverity {
    // Critical errors that break core functionality
    if (type === ErrorType.AUTHENTICATION || type === ErrorType.DATABASE) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity for network and permission issues
    if (type === ErrorType.NETWORK || type === ErrorType.PERMISSION) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity for validation errors
    if (type === ErrorType.VALIDATION) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from various sources
    if (typeof window !== 'undefined') {
      // Check localStorage
      const stored = localStorage.getItem('user-id');
      if (stored != null) return stored;

      // Check sessionStorage
      const session = sessionStorage.getItem('user-id');
      if (session != null) return session;
    }

    return undefined;
  }

  private logError(errorDetails: ErrorDetails) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught error:', errorDetails);
    }

    // Send to telemetry service
    telemetry.trackError(
      new Error(errorDetails.message),
      `error_boundary_${errorDetails.type}`,
      {
        severity: errorDetails.severity,
        type: errorDetails.type,
        retryCount: this.state.retryCount,
        userId: errorDetails.userId,
        url: errorDetails.url,
      }
    );
  }

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    this.setState({ isRetrying: true });

    // Clear error state after a short delay
    this.retryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1,
        isRetrying: false,
      });
    }, 1000);
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private handleContactSupport = () => {
    if (typeof window !== 'undefined') {
      const subject = encodeURIComponent('Error Report');
      const body = encodeURIComponent(`
Error Type: ${this.state.error?.name || 'Unknown'}
Error Message: ${this.state.error?.message || 'No message'}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
User Agent: ${window.navigator.userAgent}
      `);

      window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
    }
  };

  private getErrorIcon(type: ErrorType) {
    switch (type) {
      case ErrorType.AUTHENTICATION:
        return <Shield className="h-8 w-8 text-red-500" />;
      case ErrorType.DATABASE:
        return <Database className="h-8 w-8 text-orange-500" />;
      case ErrorType.NETWORK:
        return <Globe className="h-8 w-8 text-yellow-500" />;
      case ErrorType.PERMISSION:
        return <User className="h-8 w-8 text-purple-500" />;
      default:
        return <Bug className="h-8 w-8 text-gray-500" />;
    }
  }

  private getErrorTitle(type: ErrorType) {
    switch (type) {
      case ErrorType.AUTHENTICATION:
        return 'Authentication Error';
      case ErrorType.DATABASE:
        return 'Database Connection Error';
      case ErrorType.NETWORK:
        return 'Network Error';
      case ErrorType.PERMISSION:
        return 'Permission Denied';
      case ErrorType.VALIDATION:
        return 'Validation Error';
      default:
        return 'Something went wrong';
    }
  }

  private getErrorDescription(type: ErrorType) {
    switch (type) {
      case ErrorType.AUTHENTICATION:
        return 'There was a problem with your authentication. Please try signing in again.';
      case ErrorType.DATABASE:
        return "We're having trouble connecting to our database. Please try again in a moment.";
      case ErrorType.NETWORK:
        return 'There was a network connectivity issue. Please check your internet connection.';
      case ErrorType.PERMISSION:
        return "You don't have permission to access this resource.";
      case ErrorType.VALIDATION:
        return 'The data you provided is invalid. Please check your input and try again.';
      default:
        return 'An unexpected error occurred. Our team has been notified.';
    }
  }

  private getRecoveryActions(type: ErrorType) {
    const actions = [];

    // Retry action for most error types
    if (type !== ErrorType.PERMISSION && this.props.allowRetry !== false) {
      actions.push({
        label: 'Try Again',
        icon: <RefreshCw className="h-4 w-4" />,
        onClick: this.handleRetry,
        variant: 'default' as const,
        disabled:
          this.state.retryCount >= this.maxRetries || this.state.isRetrying,
      });
    }

    // Go home action
    actions.push({
      label: 'Go Home',
      icon: <Home className="h-4 w-4" />,
      onClick: this.handleGoHome,
      variant: 'outline' as const,
    });

    // Contact support for critical errors
    if (type === ErrorType.AUTHENTICATION || type === ErrorType.DATABASE) {
      actions.push({
        label: 'Contact Support',
        icon: <Mail className="h-4 w-4" />,
        onClick: this.handleContactSupport,
        variant: 'outline' as const,
      });
    }

    return actions;
  }

  override render() {
    if (this.state.hasError) {
      const { error, errorInfo, isRetrying } = this.state;
      const errorType = this.detectErrorType(error!, this.props.errorType);
      const severity = this.determineSeverity(error!, errorType);
      const showDetails =
        this.props.showDetails || process.env.NODE_ENV === 'development';

      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {this.getErrorIcon(errorType)}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {this.getErrorTitle(errorType)}
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                {this.getErrorDescription(errorType)}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error severity badge */}
              <div className="flex justify-center">
                <Badge
                  variant={
                    severity === ErrorSeverity.CRITICAL
                      ? 'destructive'
                      : severity === ErrorSeverity.HIGH
                        ? 'destructive'
                        : severity === ErrorSeverity.MEDIUM
                          ? 'default'
                          : 'secondary'
                  }
                >
                  {severity.toUpperCase()} SEVERITY
                </Badge>
              </div>

              {/* Retry count */}
              {this.state.retryCount > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Retry attempt {this.state.retryCount} of {this.maxRetries}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error details in development */}
              {showDetails && (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>
                          <strong>Error:</strong> {error?.name}
                        </p>
                        <p>
                          <strong>Message:</strong> {error?.message}
                        </p>
                        {error?.stack && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm font-medium">
                              Stack Trace
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                              {error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Recovery actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                {this.getRecoveryActions(errorType).map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className="flex items-center gap-2"
                  >
                    {action.icon}
                    {action.label}
                    {isRetrying && action.label === 'Try Again' && (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    )}
                  </Button>
                ))}
              </div>

              {/* Additional help text */}
              <div className="text-center text-sm text-gray-500">
                {errorType === ErrorType.AUTHENTICATION && (
                  <p>
                    If this problem persists, please contact your administrator.
                  </p>
                )}
                {errorType === ErrorType.DATABASE && (
                  <p>
                    Our team has been notified and is working to resolve this
                    issue.
                  </p>
                )}
                {errorType === ErrorType.NETWORK && (
                  <p>Please check your internet connection and try again.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience components for different error types
export const AuthErrorBoundary: React.FC<
  Omit<ErrorBoundaryProps, 'errorType'>
> = props => <ErrorBoundary {...props} errorType={ErrorType.AUTHENTICATION} />;

export const DatabaseErrorBoundary: React.FC<
  Omit<ErrorBoundaryProps, 'errorType'>
> = props => <ErrorBoundary {...props} errorType={ErrorType.DATABASE} />;

export const NetworkErrorBoundary: React.FC<
  Omit<ErrorBoundaryProps, 'errorType'>
> = props => <ErrorBoundary {...props} errorType={ErrorType.NETWORK} />;

export const ValidationErrorBoundary: React.FC<
  Omit<ErrorBoundaryProps, 'errorType'>
> = props => <ErrorBoundary {...props} errorType={ErrorType.VALIDATION} />;

export const PermissionErrorBoundary: React.FC<
  Omit<ErrorBoundaryProps, 'errorType'>
> = props => <ErrorBoundary {...props} errorType={ErrorType.PERMISSION} />;
