import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/projects',
    '/photos',
    '/change-orders',
    '/analytics',
    '/team',
    '/divisions',
    '/notifications',
    '/profile',
    '/settings',
  ]

  // Admin-only routes
  const adminRoutes = [
    '/analytics',
    '/team',
    '/divisions',
  ]

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth',
    '/auth/callback',
    '/login',
    '/signup',
  ]

  const { pathname } = req.nextUrl

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

  // If user is not authenticated and trying to access protected route
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth pages
  if (session && (pathname === '/login' || pathname === '/signup' || pathname === '/auth')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If user is authenticated, check admin routes
  if (session && isAdminRoute) {
    try {
      // Get user profile to check role
      const { data: userProfile } = await supabase
        .from('users')
        .select(`
          *,
          user_divisions (
            role,
            division:divisions (*)
          )
        `)
        .eq('supabase_user_id', session.user.id)
        .single()

      if (userProfile) {
        const hasAdminRole = userProfile.user_divisions?.some(
          (ud: any) => ud.role === 'admin'
        )

        if (!hasAdminRole) {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
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
}
