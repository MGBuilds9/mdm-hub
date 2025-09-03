/**
 * Monitoring and Error Tracking Setup
 * 
 * This file provides comprehensive monitoring including:
 * - Sentry integration for error tracking
 * - Performance monitoring for database queries
 * - User session analytics
 * - Custom metrics for auth success/failure rates
 * - Alerts for critical errors like API key failures
 */

import { telemetry } from './telemetry';

// Sentry configuration
let Sentry: any = null;
let isSentryInitialized = false;

// Performance monitoring
interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Custom metrics
interface CustomMetric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: number;
}

// Alert configuration
interface AlertConfig {
  name: string;
  condition: (metric: any) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  action?: () => void;
}

class MonitoringService {
  private performanceMetrics: PerformanceMetric[] = [];
  private customMetrics: CustomMetric[] = [];
  private alerts: AlertConfig[] = [];
  private sessionStartTime: number = Date.now();
  private userId: string | null = null;

  constructor() {
    this.initializeSentry();
    this.setupPerformanceMonitoring();
    this.setupCustomMetrics();
    this.setupAlerts();
  }

  /**
   * Initialize Sentry for error tracking
   */
  private async initializeSentry() {
    try {
      // Dynamic import to avoid bundling in client if not needed
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
        const SentryModule = await import('@sentry/nextjs');
        Sentry = SentryModule;
        
        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          environment: process.env.NODE_ENV,
          tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
          beforeSend(event) {
            // Filter out non-critical errors in production
            if (process.env.NODE_ENV === 'production') {
              const error = event.exception?.values?.[0];
              if (error?.type === 'ChunkLoadError' || error?.type === 'Loading chunk failed') {
                return null; // Don't send chunk load errors
              }
            }
            return event;
          },
          integrations: [
            new Sentry.BrowserTracing({
              routingInstrumentation: Sentry.nextjsRouterInstrumentation(),
            }),
          ],
        });

        isSentryInitialized = true;
        console.log('Sentry initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.recordPerformanceMetric('page_load', navigation.loadEventEnd - navigation.fetchStart, {
          url: window.location.href,
          userAgent: navigator.userAgent,
        });
      }
    });

    // Monitor database query performance
    this.interceptSupabaseQueries();
  }

  /**
   * Intercept Supabase queries for performance monitoring
   */
  private interceptSupabaseQueries() {
    if (typeof window === 'undefined') return;

    // This would need to be integrated with the actual Supabase client
    // For now, we'll provide a manual way to track queries
    console.log('Database query monitoring enabled');
  }

  /**
   * Setup custom metrics tracking
   */
  private setupCustomMetrics() {
    // Track authentication events
    this.trackAuthEvents();
    
    // Track user interactions
    this.trackUserInteractions();
    
    // Track API usage
    this.trackAPIUsage();
  }

  /**
   * Track authentication events
   */
  private trackAuthEvents() {
    // This would integrate with the auth context
    console.log('Authentication event tracking enabled');
  }

  /**
   * Track user interactions
   */
  private trackUserInteractions() {
    if (typeof window === 'undefined') return;

    // Track button clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        this.recordCustomMetric('button_click', 1, {
          button_text: target.textContent?.substring(0, 50) || 'unknown',
          page: window.location.pathname,
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.recordCustomMetric('form_submission', 1, {
        form_id: form.id || 'unknown',
        form_action: form.action || 'unknown',
        page: window.location.pathname,
      });
    });
  }

  /**
   * Track API usage
   */
  private trackAPIUsage() {
    if (typeof window === 'undefined') return;

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0]?.toString() || 'unknown';
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        this.recordCustomMetric('api_request', 1, {
          url: url.substring(0, 100),
          status: response.status.toString(),
          duration: duration.toString(),
        });
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        this.recordCustomMetric('api_error', 1, {
          url: url.substring(0, 100),
          error: error instanceof Error ? error.message : 'unknown',
          duration: duration.toString(),
        });
        
        throw error;
      }
    };
  }

  /**
   * Setup alerts for critical errors
   */
  private setupAlerts() {
    this.alerts = [
      {
        name: 'api_key_failure',
        condition: (metric) => metric.name === 'api_error' && metric.tags?.error?.includes('API key'),
        severity: 'critical',
        message: 'API key authentication failure detected',
        action: () => {
          console.error('CRITICAL: API key failure detected');
          // In production, this would send alerts to monitoring systems
        },
      },
      {
        name: 'high_error_rate',
        condition: (metric) => {
          const recentErrors = this.customMetrics.filter(
            m => m.name === 'api_error' && 
            Date.now() - m.timestamp < 5 * 60 * 1000 // Last 5 minutes
          );
          return recentErrors.length > 10;
        },
        severity: 'high',
        message: 'High error rate detected in the last 5 minutes',
      },
      {
        name: 'slow_database_queries',
        condition: (metric) => metric.name === 'db_query' && metric.value > 5000, // 5 seconds
        severity: 'medium',
        message: 'Slow database query detected',
      },
    ];
  }

  /**
   * Record a performance metric
   */
  recordPerformanceMetric(name: string, duration: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.performanceMetrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    // Send to telemetry
    telemetry.track({
      event: 'performance_metric',
      properties: {
        name,
        duration,
        metadata,
      },
    });

    // Check for alerts
    this.checkAlerts(metric);
  }

  /**
   * Record a custom metric
   */
  recordCustomMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric: CustomMetric = {
      name,
      value,
      tags,
      timestamp: Date.now(),
    };

    this.customMetrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.customMetrics.length > 1000) {
      this.customMetrics = this.customMetrics.slice(-1000);
    }

    // Send to telemetry
    telemetry.track({
      event: 'custom_metric',
      properties: {
        name,
        value,
        tags,
      },
    });

    // Check for alerts
    this.checkAlerts(metric);
  }

  /**
   * Check alerts for a metric
   */
  private checkAlerts(metric: PerformanceMetric | CustomMetric) {
    for (const alert of this.alerts) {
      if (alert.condition(metric)) {
        console.warn(`ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
        
        // Send alert to telemetry
        telemetry.track({
          event: 'alert_triggered',
          properties: {
            alert_name: alert.name,
            severity: alert.severity,
            message: alert.message,
            metric_name: metric.name,
          },
        });

        // Execute alert action
        if (alert.action) {
          alert.action();
        }
      }
    }
  }

  /**
   * Set user context for monitoring
   */
  setUser(userId: string, userInfo?: Record<string, any>) {
    this.userId = userId;
    
    if (isSentryInitialized && Sentry) {
      Sentry.setUser({
        id: userId,
        ...userInfo,
      });
    }

    telemetry.identify(userId, userInfo);
  }

  /**
   * Track authentication success
   */
  trackAuthSuccess(method: string, userId?: string) {
    this.recordCustomMetric('auth_success', 1, {
      method,
      user_id: userId || this.userId || 'unknown',
    });

    if (isSentryInitialized && Sentry) {
      Sentry.addBreadcrumb({
        message: 'User authentication successful',
        category: 'auth',
        level: 'info',
        data: { method, userId: userId || this.userId },
      });
    }
  }

  /**
   * Track authentication failure
   */
  trackAuthFailure(method: string, error: string, userId?: string) {
    this.recordCustomMetric('auth_failure', 1, {
      method,
      error: error.substring(0, 100),
      user_id: userId || this.userId || 'unknown',
    });

    if (isSentryInitialized && Sentry) {
      Sentry.addBreadcrumb({
        message: 'User authentication failed',
        category: 'auth',
        level: 'error',
        data: { method, error, userId: userId || this.userId },
      });
    }
  }

  /**
   * Track database query performance
   */
  trackDatabaseQuery(query: string, duration: number, success: boolean) {
    this.recordPerformanceMetric('db_query', duration, {
      query: query.substring(0, 100),
      success,
    });

    if (!success) {
      this.recordCustomMetric('db_query_error', 1, {
        query: query.substring(0, 100),
      });
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.performanceMetrics.filter(m => m.name === name);
    }
    return [...this.performanceMetrics];
  }

  /**
   * Get custom metrics
   */
  getCustomMetrics(name?: string): CustomMetric[] {
    if (name) {
      return this.customMetrics.filter(m => m.name === name);
    }
    return [...this.customMetrics];
  }

  /**
   * Get session duration
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }

  /**
   * Capture exception with Sentry
   */
  captureException(error: Error, context?: Record<string, any>) {
    if (isSentryInitialized && Sentry) {
      Sentry.captureException(error, {
        tags: {
          component: 'monitoring',
          ...context,
        },
      });
    }

    // Also send to telemetry
    telemetry.trackError(error, 'monitoring_capture', context);
  }

  /**
   * Capture message with Sentry
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (isSentryInitialized && Sentry) {
      Sentry.captureMessage(message, level);
    }

    // Also send to telemetry
    telemetry.track({
      event: 'monitoring_message',
      properties: {
        message,
        level,
      },
    });
  }
}

// Create singleton instance
export const monitoring = new MonitoringService();

// Export convenience functions
export const trackPerformance = (name: string, duration: number, metadata?: Record<string, any>) => {
  monitoring.recordPerformanceMetric(name, duration, metadata);
};

export const trackMetric = (name: string, value: number, tags?: Record<string, string>) => {
  monitoring.recordCustomMetric(name, value, tags);
};

export const trackAuthSuccess = (method: string, userId?: string) => {
  monitoring.trackAuthSuccess(method, userId);
};

export const trackAuthFailure = (method: string, error: string, userId?: string) => {
  monitoring.trackAuthFailure(method, error, userId);
};

export const trackDatabaseQuery = (query: string, duration: number, success: boolean) => {
  monitoring.trackDatabaseQuery(query, duration, success);
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  monitoring.captureException(error, context);
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  monitoring.captureMessage(message, level);
};

export const setUser = (userId: string, userInfo?: Record<string, any>) => {
  monitoring.setUser(userId, userInfo);
};
