/**
 * Retry utility with exponential backoff for handling transient failures
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  retryCondition?: (error: Error) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  jitter: true,
  retryCondition: () => true, // Retry all errors by default
};

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  options: Required<RetryOptions>
): number {
  const exponentialDelay =
    options.baseDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, options.maxDelay);

  if (options.jitter) {
    // Add random jitter (±25% of the delay)
    const jitterRange = cappedDelay * 0.25;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;
    return Math.max(0, cappedDelay + jitter);
  }

  return cappedDelay;
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const data = await fn();
      return {
        success: true,
        data,
        attempts: attempt,
        totalDuration: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry this error
      if (!opts.retryCondition(lastError)) {
        return {
          success: false,
          error: lastError,
          attempts: attempt,
          totalDuration: Date.now() - startTime,
        };
      }

      // Don't wait after the last attempt
      if (attempt < opts.maxAttempts) {
        const delay = calculateDelay(attempt, opts);
        console.log(
          `Retry attempt ${attempt} failed, waiting ${delay}ms before retry ${attempt + 1}...`
        );
        await sleep(delay);
      }
    }
  }

  return {
    success: false,
    error: lastError!,
    attempts: opts.maxAttempts,
    totalDuration: Date.now() - startTime,
  };
}

/**
 * Retry condition for network-related errors
 */
export const isRetryableError = (error: Error): boolean => {
  const retryableErrors = [
    'NetworkError',
    'TimeoutError',
    'ConnectionError',
    'ECONNRESET',
    'ENOTFOUND',
    'ECONNREFUSED',
    'ETIMEDOUT',
  ];

  const retryableMessages = [
    'network',
    'timeout',
    'connection',
    'fetch',
    'temporary',
    'service unavailable',
    'bad gateway',
    'gateway timeout',
  ];

  const errorName = error.name.toLowerCase();
  const errorMessage = error.message.toLowerCase();

  return (
    retryableErrors.some(err => errorName.includes(err.toLowerCase())) ||
    retryableMessages.some(msg => errorMessage.includes(msg))
  );
};

/**
 * Retry condition for Supabase-specific errors
 */
export const isSupabaseRetryableError = (error: Error): boolean => {
  const supabaseRetryableErrors = [
    'JWT_EXPIRED',
    'PGRST301', // Connection error
    'PGRST116', // Connection timeout
  ];

  const errorMessage = error.message.toUpperCase();
  return supabaseRetryableErrors.some(err => errorMessage.includes(err));
};

/**
 * Retry condition for authentication errors
 */
export const isAuthRetryableError = (error: Error): boolean => {
  const authRetryableErrors = [
    'JWT_EXPIRED',
    'INVALID_JWT',
    'TOKEN_REFRESH_FAILED',
  ];

  const errorMessage = error.message.toUpperCase();
  return authRetryableErrors.some(err => errorMessage.includes(err));
};

/**
 * Create a retry function with predefined options for common use cases
 */
export const createRetryFunction = (options: RetryOptions) => {
  return <T>(fn: () => Promise<T>) => retry(fn, options);
};

// Predefined retry functions for common scenarios
export const retryNetwork = createRetryFunction({
  maxAttempts: 3,
  baseDelay: 1000,
  retryCondition: isRetryableError,
});

export const retrySupabase = createRetryFunction({
  maxAttempts: 3,
  baseDelay: 1000,
  retryCondition: isSupabaseRetryableError,
});

export const retryAuth = createRetryFunction({
  maxAttempts: 2,
  baseDelay: 500,
  retryCondition: isAuthRetryableError,
});

export const retryCritical = createRetryFunction({
  maxAttempts: 5,
  baseDelay: 2000,
  maxDelay: 30000,
  retryCondition: isRetryableError,
});
