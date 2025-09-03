/**
 * Health Check API Route
 *
 * Provides comprehensive health monitoring for production environments.
 * Checks Supabase connection, Azure AD configuration, database connectivity,
 * and returns structured health status with proper error codes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { configService, type Configuration } from '@/services/config.service';
import { telemetry } from '@/lib/telemetry';

// Health check result types
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    configuration: CheckResult;
    supabase: CheckResult;
    azure: CheckResult;
    database: CheckResult;
    overall: CheckResult;
  };
  metrics: {
    responseTime: number;
    uptime: number;
  };
}

export interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
  responseTime?: number;
}

// Health check status codes
const HEALTH_STATUS_CODES = {
  healthy: 200,
  degraded: 200, // Still operational but with warnings
  unhealthy: 503, // Service unavailable
} as const;

// Start time for uptime calculation
const startTime = Date.now();

/**
 * GET /api/health
 *
 * Performs comprehensive health checks and returns structured status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const healthCheckStart = Date.now();

  try {
    // Get configuration
    let config: Configuration;
    try {
      config = await configService.validateAndGetConfig();
    } catch (error) {
      return createHealthResponse(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          checks: {
            configuration: {
              status: 'fail',
              message: 'Configuration validation failed',
              details: error instanceof Error ? error.message : 'Unknown error',
            },
            supabase: {
              status: 'fail',
              message: 'Not checked - configuration invalid',
            },
            azure: {
              status: 'fail',
              message: 'Not checked - configuration invalid',
            },
            database: {
              status: 'fail',
              message: 'Not checked - configuration invalid',
            },
            overall: {
              status: 'fail',
              message: 'System unhealthy due to configuration issues',
            },
          },
          metrics: {
            responseTime: Date.now() - healthCheckStart,
            uptime: Date.now() - startTime,
          },
        },
        'unhealthy'
      );
    }

    // Perform health checks
    const checks = await performHealthChecks(config, healthCheckStart);

    // Determine overall status
    const overallStatus = determineOverallStatus(checks);

    // Create health response
    const healthResult: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.app.environment,
      checks,
      metrics: {
        responseTime: Date.now() - healthCheckStart,
        uptime: Date.now() - startTime,
      },
    };

    // Track health check
    telemetry.track({
      event: 'health_check',
      properties: {
        status: overallStatus,
        environment: config.app.environment,
        responseTime: healthResult.metrics.responseTime,
        checks: Object.fromEntries(
          Object.entries(checks).map(([key, check]) => [key, check.status])
        ),
      },
    });

    return createHealthResponse(healthResult, overallStatus);
  } catch (error) {
    // Critical error during health check
    telemetry.trackError(error as Error, 'health_check_critical_error');

    return createHealthResponse(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: {
          configuration: {
            status: 'fail',
            message: 'Critical error during health check',
          },
          supabase: { status: 'fail', message: 'Not checked - critical error' },
          azure: { status: 'fail', message: 'Not checked - critical error' },
          database: { status: 'fail', message: 'Not checked - critical error' },
          overall: { status: 'fail', message: 'Critical system error' },
        },
        metrics: {
          responseTime: Date.now() - healthCheckStart,
          uptime: Date.now() - startTime,
        },
      },
      'unhealthy'
    );
  }
}

/**
 * Performs all health checks
 */
async function performHealthChecks(
  config: Configuration,
  startTime: number
): Promise<HealthCheckResult['checks']> {
  const checks: HealthCheckResult['checks'] = {
    configuration: await checkConfiguration(config),
    supabase: await checkSupabase(config),
    azure: await checkAzure(config),
    database: await checkDatabase(config),
    overall: { status: 'pass', message: 'All checks passed' }, // Will be updated
  };

  // Update overall status
  checks.overall = determineOverallCheck(checks);

  return checks;
}

/**
 * Checks configuration validity
 */
async function checkConfiguration(config: Configuration): Promise<CheckResult> {
  const start = Date.now();

  try {
    const validation = config.validation;

    if (validation.isValid) {
      return {
        status: 'pass',
        message: 'Configuration is valid',
        details: {
          warnings: validation.warnings,
          features: config.features,
        },
        responseTime: Date.now() - start,
      };
    } else {
      return {
        status: 'fail',
        message: 'Configuration validation failed',
        details: {
          errors: validation.errors,
          warnings: validation.warnings,
        },
        responseTime: Date.now() - start,
      };
    }
  } catch (error) {
    return {
      status: 'fail',
      message: 'Configuration check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - start,
    };
  }
}

/**
 * Checks Supabase connectivity
 */
async function checkSupabase(config: Configuration): Promise<CheckResult> {
  const start = Date.now();

  if (!config.features.supabaseAuth) {
    return {
      status: 'warn',
      message: 'Supabase authentication disabled',
      responseTime: Date.now() - start,
    };
  }

  try {
    // Use server-side health check function
    const { checkServerSupabaseHealth } = await import('@/lib/supabase-server');
    const healthResult = await checkServerSupabaseHealth();

    if (!healthResult.healthy) {
      return {
        status: 'fail',
        message: 'Supabase connection failed',
        details: {
          error: healthResult.error,
        },
        responseTime: Date.now() - start,
      };
    }

    return {
      status: 'pass',
      message: 'Supabase connection healthy',
      details: {
        url: config.supabase.url,
        hasServiceRole: !!config.supabase.serviceRoleKey,
      },
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: 'Supabase check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - start,
    };
  }
}

/**
 * Checks Azure AD configuration
 */
async function checkAzure(config: Configuration): Promise<CheckResult> {
  const start = Date.now();

  if (!config.features.azureAuth) {
    return {
      status: 'warn',
      message: 'Azure AD authentication disabled',
      responseTime: Date.now() - start,
    };
  }

  try {
    // Validate Azure configuration
    const { validateAzureConfig } = await import('@/lib/azure-auth');
    const { isValid, errors } = validateAzureConfig();

    if (!isValid) {
      return {
        status: 'fail',
        message: 'Azure AD configuration invalid',
        details: {
          errors,
          clientId: config.azure.clientId ? 'Set' : 'Missing',
          tenantId: config.azure.tenantId ? 'Set' : 'Missing',
          authority: config.azure.authority,
          redirectUri: config.azure.redirectUri,
        },
        responseTime: Date.now() - start,
      };
    }

    // Test Azure AD connectivity (basic validation)
    try {
      const authorityUrl = new URL(config.azure.authority);
      const response = await fetch(
        `${authorityUrl.origin}/.well-known/openid_configuration`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        return {
          status: 'warn',
          message: 'Azure AD authority not reachable',
          details: {
            status: response.status,
            statusText: response.statusText,
          },
          responseTime: Date.now() - start,
        };
      }
    } catch (fetchError) {
      return {
        status: 'warn',
        message: 'Azure AD authority check failed',
        details:
          fetchError instanceof Error ? fetchError.message : 'Unknown error',
        responseTime: Date.now() - start,
      };
    }

    return {
      status: 'pass',
      message: 'Azure AD configuration healthy',
      details: {
        clientId: config.azure.clientId ? 'Set' : 'Missing',
        tenantId: config.azure.tenantId,
        authority: config.azure.authority,
        redirectUri: config.azure.redirectUri,
      },
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: 'Azure AD check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - start,
    };
  }
}

/**
 * Checks database connectivity
 */
async function checkDatabase(config: Configuration): Promise<CheckResult> {
  const start = Date.now();

  if (!config.database.enabled) {
    return {
      status: 'warn',
      message: 'Database not configured',
      responseTime: Date.now() - start,
    };
  }

  try {
    // Test database connection through Supabase
    if (config.features.supabaseAuth) {
      const { createClient } = await import('@supabase/supabase-js');

      const supabase = createClient(
        config.supabase.url,
        config.supabase.serviceRoleKey || config.supabase.anonKey
      );

      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        return {
          status: 'fail',
          message: 'Database connection failed',
          details: {
            error: error.message,
            code: error.code,
          },
          responseTime: Date.now() - start,
        };
      }

      return {
        status: 'pass',
        message: 'Database connection healthy',
        details: {
          type: 'Supabase',
          url: config.supabase.url,
        },
        responseTime: Date.now() - start,
      };
    }

    return {
      status: 'warn',
      message: 'Database check not implemented for current configuration',
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: 'Database check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - start,
    };
  }
}

/**
 * Determines overall health status
 */
function determineOverallStatus(
  checks: Omit<HealthCheckResult['checks'], 'overall'>
): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = Object.values(checks).map(check => check.status);

  if (statuses.includes('fail')) {
    return 'unhealthy';
  }

  if (statuses.includes('warn')) {
    return 'degraded';
  }

  return 'healthy';
}

/**
 * Determines overall check result
 */
function determineOverallCheck(
  checks: Omit<HealthCheckResult['checks'], 'overall'>
): CheckResult {
  const overallStatus = determineOverallStatus(checks);

  const failedChecks = Object.entries(checks)
    .filter(([_, check]) => check.status === 'fail')
    .map(([name, check]) => `${name}: ${check.message}`);

  const warningChecks = Object.entries(checks)
    .filter(([_, check]) => check.status === 'warn')
    .map(([name, check]) => `${name}: ${check.message}`);

  let message = 'All systems operational';
  if (failedChecks.length > 0) {
    message = `Failed checks: ${failedChecks.join(', ')}`;
  } else if (warningChecks.length > 0) {
    message = `Warning checks: ${warningChecks.join(', ')}`;
  }

  return {
    status:
      overallStatus === 'healthy'
        ? 'pass'
        : overallStatus === 'degraded'
          ? 'warn'
          : 'fail',
    message,
    details: {
      failedChecks,
      warningChecks,
    },
  };
}

/**
 * Creates health check response with appropriate status code
 */
function createHealthResponse(
  healthResult: HealthCheckResult,
  status: 'healthy' | 'degraded' | 'unhealthy'
): NextResponse {
  const statusCode = HEALTH_STATUS_CODES[status];

  return NextResponse.json(healthResult, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Status': status,
      'X-Response-Time': healthResult.metrics.responseTime.toString(),
    },
  });
}
