import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Create a single response object that we'll modify throughout
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a single Supabase client for all operations
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh the session - this is critical for auth to work
  // This call also refreshes expired tokens
  let user = null
  try {
    const { data: { user: userData }, error } = await supabase.auth.getUser()
    if (!error) {
      user = userData
    }
  } catch (error) {
    console.error('[Middleware] Error getting user:', error)
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/admin-dashboard', '/onboarding']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If accessing a protected route without being logged in, redirect to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // If user is logged in, handle specific route logic
  if (user) {
    try {
      // Get member data once for all checks
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('is_admin')
        .eq('user_id', user.id)
        .maybeSingle()

      console.log('[Middleware] User:', user.id, 'Path:', pathname, 'Member:', member, 'Error:', memberError)

      // If user is on auth pages and already has an account, redirect to dashboard
      if (pathname.startsWith('/auth')) {
        if (member) {
          const url = request.nextUrl.clone()
          url.pathname = member.is_admin ? '/admin-dashboard' : '/dashboard'
          return NextResponse.redirect(url)
        }
      }

      // If user is on onboarding but already has a member record, redirect to dashboard
      if (pathname === '/onboarding') {
        if (member) {
          const url = request.nextUrl.clone()
          url.pathname = member.is_admin ? '/admin-dashboard' : '/dashboard'
          return NextResponse.redirect(url)
        }
        // User is authenticated but has no member record - let them proceed to onboarding
        return response
      }

      // Protect admin routes - redirect non-admins to member dashboard
      if (pathname.startsWith('/admin-dashboard')) {
        if (!member || !member.is_admin) {
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard'
          return NextResponse.redirect(url)
        }
      }

      // Protect member dashboard routes - redirect users without member records to onboarding
      if (pathname.startsWith('/dashboard')) {
        if (!member) {
          const url = request.nextUrl.clone()
          url.pathname = '/onboarding'
          return NextResponse.redirect(url)
        }
      }
    } catch (error) {
      console.error('[Middleware] Error in auth checks:', error)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
