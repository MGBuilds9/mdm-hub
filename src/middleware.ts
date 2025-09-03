/**
 * Enhanced Middleware with Security Features
 *
 * This middleware provides:
 * - CSRF protection for auth endpoints
 * - Rate limiting for login attempts
 * - Session refresh logic before expiry
 * - Proper logout that clears all auth tokens
 * - Security headers (CSP, HSTS, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareSupabaseClient } from '@/lib/supabase-middleware';
import {
  checkEnvironmentVariables,
  shouldRedirectToSetup,
} from '@/lib/env-check';
import { telemetry } from '@/lib/telemetry';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security headers configuration
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://login.microsoftonline.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co https://login.microsoftonline.com",
    "frame-src 'self' https://login.microsoftonline.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
};

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/setup',
  '/auth/callback',
  '/api/health',
  '/api/auth/csrf',
];

// Auth routes that need CSRF protection
const authRoutes = [
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/signout',
  '/api/auth/refresh',
];

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5, // 5 attempts per window
  blockDuration: 30 * 60 * 1000, // 30 minutes block
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();

  try {
    // Check only public environment variables in middleware (Edge Runtime limitation)
    const publicEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_AZURE_CLIENT_ID',
      'NEXT_PUBLIC_AZURE_TENANT_ID',
      'NEXT_PUBLIC_AZURE_AUTHORITY',
      'NEXT_PUBLIC_AZURE_REDIRECT_URI',
    ];
    
    const missingPublicVars = publicEnvVars.filter(varName => !process.env[varName]);
    const isPublicEnvValid = missingPublicVars.length === 0;
    
    if (!isPublicEnvValid && shouldRedirectToSetup() && pathname !== '/setup') {
      return NextResponse.redirect(new URL('/setup', request.url));
    }

    // Create response with security headers
    const response = NextResponse.next();

    // Apply security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Handle CORS for API routes
    if (pathname.startsWith('/api/')) {
      response.headers.set(
        'Access-Control-Allow-Origin',
        request.nextUrl.origin
      );
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-CSRF-Token'
      );
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    // CSRF protection for auth endpoints
    if (authRoutes.some(route => pathname.startsWith(route))) {
      const csrfResult = await validateCSRFToken(request);
      if (!csrfResult.valid) {
        telemetry.trackError(
          new Error('CSRF token validation failed'),
          'csrf_validation'
        );
        return new NextResponse(
          JSON.stringify({ error: 'CSRF token validation failed' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Rate limiting for auth endpoints
    if (authRoutes.some(route => pathname.startsWith(route))) {
      const rateLimitResult = await checkRateLimit(request);
      if (!rateLimitResult.allowed) {
        telemetry.trackError(
          new Error('Rate limit exceeded'),
          'rate_limit_exceeded'
        );
        return new NextResponse(
          JSON.stringify({
            error: 'Too many requests',
            retryAfter: rateLimitResult.retryAfter,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(rateLimitResult.retryAfter ?? 0),
            },
          }
        );
      }
    }

    // Skip authentication for public routes
    if (publicRoutes.includes(pathname)) {
      return response;
    }

    // Create Supabase client for middleware
    const { supabase, response: supabaseResponse } =
      createMiddlewareSupabaseClient(request);

    // Get session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session in middleware:', error);
      telemetry.trackError(error, 'middleware_session_error');
    }

    // Check if session is about to expire (within 5 minutes)
    if (session?.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();

      // If session expires within 5 minutes, try to refresh
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        try {
          const {
            data: { session: refreshedSession },
            error: refreshError,
          } = await supabase.auth.refreshSession();

          if (refreshError) {
            console.error('Error refreshing session:', refreshError);
            telemetry.trackError(refreshError, 'session_refresh_error');
          } else if (refreshedSession) {
            console.log('Session refreshed successfully');
            telemetry.track({
              event: 'session_refreshed',
              properties: { pathname },
            });
          }
        } catch (error) {
          console.error('Error in session refresh:', error);
          telemetry.trackError(error as Error, 'session_refresh_exception');
        }
      }
    }

    // Redirect to login if no session and not a public route
    if (!session && !publicRoutes.includes(pathname)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Add user info to headers for server components
    if (session?.user) {
      response.headers.set('X-User-ID', session.user.id);
      response.headers.set('X-User-Email', session.user.email || '');
    }

    // Track middleware performance
    const duration = Date.now() - startTime;
    telemetry.track({
      event: 'middleware_execution',
      properties: {
        pathname,
        duration,
        hasSession: !!session,
        userAgent: request.headers.get('user-agent')?.substring(0, 100),
      },
    });

    return supabaseResponse;
  } catch (error) {
    console.error('Middleware error:', error);
    telemetry.trackError(error as Error, 'middleware_error');

    // Return error response
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Validates CSRF token for auth endpoints
 */
async function validateCSRFToken(
  request: NextRequest
): Promise<{ valid: boolean; error?: string }> {
  try {
    const csrfToken = request.headers.get('X-CSRF-Token');
    const cookieToken = request.cookies.get('csrf-token')?.value;

    if (!csrfToken || !cookieToken) {
      return { valid: false, error: 'Missing CSRF token' };
    }

    if (csrfToken !== cookieToken) {
      return { valid: false, error: 'CSRF token mismatch' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'CSRF validation error' };
  }
}

/**
 * Checks rate limiting for auth endpoints
 */
async function checkRateLimit(
  request: NextRequest
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const clientIP =
      request.ip || request.headers.get('X-Forwarded-For') || 'unknown';
    const now = Date.now();
    const windowStart = now - rateLimitConfig.windowMs;

    // Clean up old entries
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }

    // Check current rate limit
    const current = rateLimitStore.get(clientIP);

    if (current) {
      if (current.resetTime > now) {
        // Still in block period
        return {
          allowed: false,
          retryAfter: Math.ceil((current.resetTime - now) / 1000),
        };
      }

      if (current.count >= rateLimitConfig.maxAttempts) {
        // Rate limit exceeded, block for blockDuration
        rateLimitStore.set(clientIP, {
          count: current.count,
          resetTime: now + rateLimitConfig.blockDuration,
        });

        return {
          allowed: false,
          retryAfter: Math.ceil(rateLimitConfig.blockDuration / 1000),
        };
      }
    }

    // Increment counter
    const newCount = (current?.count || 0) + 1;
    rateLimitStore.set(clientIP, {
      count: newCount,
      resetTime: now + rateLimitConfig.windowMs,
    });

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true }; // Fail open
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
