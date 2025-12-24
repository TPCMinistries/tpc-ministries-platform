import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Role hierarchy - higher index = more permissions
const ROLE_HIERARCHY = ['free', 'member', 'partner', 'staff', 'admin']

function hasMinimumRole(userRole: string | null | undefined, requiredRole: string): boolean {
  if (!userRole) return requiredRole === 'free'
  const userLevel = ROLE_HIERARCHY.indexOf(userRole)
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole)
  return userLevel >= 0 && userLevel >= requiredLevel
}

function isStaffOrAbove(role: string | null | undefined): boolean {
  return hasMinimumRole(role, 'staff')
}

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
      // Get member data once for all checks - include role field
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('id, is_admin, role, last_login_at, login_count')
        .eq('user_id', user.id)
        .maybeSingle()

      // Use role field, fallback to is_admin for backward compatibility
      const userRole = member?.role || (member?.is_admin ? 'admin' : 'free')

      console.log('[Middleware] User:', user.id, 'Path:', pathname, 'Role:', userRole)

      // Track login activity (update once per session, not every request)
      // Only update if last_login was more than 5 minutes ago
      if (member && isProtectedRoute) {
        const lastLogin = member.last_login_at ? new Date(member.last_login_at) : null
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

        if (!lastLogin || lastLogin < fiveMinutesAgo) {
          // Update login tracking in background (don't await)
          supabase
            .from('members')
            .update({
              last_login_at: new Date().toISOString(),
              login_count: (member.login_count || 0) + 1,
              last_active_at: new Date().toISOString(),
            })
            .eq('id', member.id)
            .then(() => {})
            .catch((err) => console.error('[Middleware] Login tracking error:', err))
        }
      }

      // If user is on auth pages and already has an account, redirect to dashboard
      if (pathname.startsWith('/auth')) {
        if (member) {
          const url = request.nextUrl.clone()
          url.pathname = isStaffOrAbove(userRole) ? '/admin-dashboard' : '/dashboard'
          return NextResponse.redirect(url)
        }
      }

      // If user is on onboarding but already has a member record, redirect to dashboard
      if (pathname === '/onboarding') {
        if (member) {
          const url = request.nextUrl.clone()
          url.pathname = isStaffOrAbove(userRole) ? '/admin-dashboard' : '/dashboard'
          return NextResponse.redirect(url)
        }
        // User is authenticated but has no member record - let them proceed to onboarding
        return response
      }

      // Protect admin routes - staff and above can access
      if (pathname.startsWith('/admin-dashboard')) {
        // Billing/settings routes are admin-only
        const adminOnlyRoutes = ['/admin-dashboard/settings/billing', '/admin-dashboard/settings/api']
        const isAdminOnlyRoute = adminOnlyRoutes.some(route => pathname.startsWith(route))

        if (isAdminOnlyRoute) {
          // Only admins can access billing/API settings
          if (userRole !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/admin-dashboard'
            return NextResponse.redirect(url)
          }
        } else {
          // Staff and above can access other admin routes
          if (!isStaffOrAbove(userRole)) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
          }
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

      // Protect partner-only content routes
      if (pathname.startsWith('/partner-content') || pathname.startsWith('/premium')) {
        if (!hasMinimumRole(userRole, 'partner')) {
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard'
          url.searchParams.set('upgrade', 'partner')
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
