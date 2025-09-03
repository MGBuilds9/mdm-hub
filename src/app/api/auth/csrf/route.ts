/**
 * CSRF Token API Route
 *
 * Provides CSRF tokens for authentication endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Generate a secure random CSRF token
    const csrfToken = randomBytes(32).toString('hex');

    // Set the token in a secure, httpOnly cookie
    const cookieStore = cookies();
    cookieStore.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    // Return the token in the response body
    return NextResponse.json(
      { csrfToken },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
