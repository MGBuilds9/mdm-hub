/**
 * Telemetry utility for tracking application events and errors
 */

export interface TelemetryEvent {
  event: string;
  timestamp: number;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface AuthTelemetryEvent extends TelemetryEvent {
  event:
    | 'auth_init_start'
    | 'auth_init_success'
    | 'auth_init_failure'
    | 'auth_retry'
    | 'auth_timeout';
  properties: {
    error?: string;
    errorCode?: string;
    retryCount?: number;
    duration?: number;
    method?: string;
  };
}

class TelemetryService {
  private sessionId: string;
  private events: TelemetryEvent[] = [];
  private maxEvents = 100; // Keep last 100 events in memory

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track an event
   */
  track(event: Omit<TelemetryEvent, 'timestamp' | 'sessionId'>): void {
    const telemetryEvent: TelemetryEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.events.push(telemetryEvent);

    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Telemetry Event:', telemetryEvent);
    }

    // In production, you would send this to your analytics service
    // this.sendToAnalytics(telemetryEvent);
  }

  /**
   * Track authentication events
   */
  trackAuth(event: Omit<AuthTelemetryEvent, 'timestamp' | 'sessionId'>): void {
    this.track(event);
  }

  /**
   * Track errors
   */
  trackError(
    error: Error,
    context?: string,
    properties?: Record<string, any>
  ): void {
    this.track({
      event: 'error',
      properties: {
        error: error.message,
        stack: error.stack,
        context,
        ...properties,
      },
    });
  }

  /**
   * Get recent events for debugging
   */
  getRecentEvents(count: number = 10): TelemetryEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Send events to analytics service (implement based on your needs)
   */
  private async sendToAnalytics(event: TelemetryEvent): Promise<void> {
    // Implement your analytics service integration here
    // Examples: Google Analytics, Mixpanel, PostHog, etc.

    try {
      // Example implementation:
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    } catch (error) {
      console.error('Failed to send telemetry event:', error);
    }
  }
}

// Singleton instance
export const telemetry = new TelemetryService();

// Helper functions for common telemetry patterns
export const trackAuthInit = (method: string = 'session_check') => {
  telemetry.trackAuth({
    event: 'auth_init_start',
    properties: { method },
  });
};

export const trackAuthSuccess = (
  duration: number,
  method: string = 'session_check'
) => {
  telemetry.trackAuth({
    event: 'auth_init_success',
    properties: { duration, method },
  });
};

export const trackAuthFailure = (
  error: Error,
  method: string = 'session_check'
) => {
  telemetry.trackAuth({
    event: 'auth_init_failure',
    properties: {
      error: error.message,
      errorCode: error.name,
      method,
    },
  });
};

export const trackAuthRetry = (
  retryCount: number,
  method: string = 'session_check'
) => {
  telemetry.trackAuth({
    event: 'auth_retry',
    properties: { retryCount, method },
  });
};

export const trackAuthTimeout = (method: string = 'session_check') => {
  telemetry.trackAuth({
    event: 'auth_timeout',
    properties: { method },
  });
};
