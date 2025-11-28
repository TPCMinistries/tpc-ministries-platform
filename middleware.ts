import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Update session first - this ensures cookies are properly set and session is refreshed
  // This MUST happen before redirecting /member/* routes so auth state is available
  let response = await updateSession(request)

  // Get user session BEFORE redirecting /member/* routes
  const supabaseForAuth = createServerClient(
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
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user: userForRedirect } } = await supabaseForAuth.auth.getUser()

  // Handle ALL /member/* redirects in middleware - this runs BEFORE Next.js route matching
  // This prevents 404s by redirecting before Next.js tries to find a route
  if (pathname.startsWith('/member/')) {
    const memberRouteMap: Record<string, string> = {
      '/member/dashboard': '/dashboard',
      '/member/messages': '/messages',
      '/member/prayer-wall': '/prayer',
      '/member/my-prayers': '/my-prayers',
      '/member/library': '/library',
      '/member/seasons': '/seasons',
      '/member/my-assessments': '/my-assessments',
      '/member/profile': '/profile',
      '/member/events': '/events',
      '/member/my-giving': '/my-giving',
      '/member/giving': '/my-giving',
      '/member/resources': '/resources',
      '/member/member-settings': '/member-settings',
      '/member/settings': '/member-settings',
      '/member/account': '/account',
      '/member/assessments': '/my-assessments',
      '/member/content': '/content',
      '/member/give': '/give',
    }
    
    const mappedPath = memberRouteMap[pathname]
    
    if (mappedPath) {
      // If redirecting to a protected route and user is not authenticated, send to onboarding
      if (!userForRedirect && (mappedPath.startsWith('/dashboard') || mappedPath.startsWith('/admin'))) {
        const url = new URL('/onboarding', request.url)
        return NextResponse.redirect(url, 307)
      }
      
      // Redirect to mapped path
      const url = new URL(mappedPath, request.url)
      return NextResponse.redirect(url, 308)
    }
    
    // Unknown /member/* path - redirect based on auth
    if (!userForRedirect) {
      const url = new URL('/onboarding', request.url)
      return NextResponse.redirect(url, 307)
    }
    
    // Authenticated but unknown path - redirect to dashboard
    const url = new URL('/dashboard', request.url)
    return NextResponse.redirect(url, 308)
  }

  // Reuse the supabase client we created above for all auth checks
  const supabase = supabaseForAuth

  // Get user session
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // If user is logged in and trying to access auth pages, redirect to appropriate dashboard
  if (pathname.startsWith('/auth') && user) {
    try {
      // Check if member record exists using the same client with proper session
      const { data: member } = await supabase
        .from('members')
        .select('is_admin')
        .eq('user_id', user.id)
        .maybeSingle()

      const url = request.nextUrl.clone()
      
      if (member) {
        // Member exists - redirect to appropriate dashboard (admins go to admin dashboard)
        url.pathname = member.is_admin ? '/admin-dashboard' : '/dashboard'
        return NextResponse.redirect(url)
      } else {
        // No member record - allow access to onboarding
        // Don't redirect here, let them go to onboarding to create member record
      }
    } catch (error) {
      // If there's an error checking member, still allow access to auth pages
      console.error('[Middleware] Error checking member record:', error)
    }
  }

  // If user is logged in and on onboarding, check if they already have a member record
  // If they do, redirect to dashboard (they don't need onboarding)
  if (pathname === '/onboarding' && user) {
    try {
      const { data: member } = await supabase
        .from('members')
        .select('is_admin')
        .eq('user_id', user.id)
        .maybeSingle()

      if (member) {
        // Member already exists - redirect to appropriate dashboard
        const url = request.nextUrl.clone()
        url.pathname = member.is_admin ? '/admin-dashboard' : '/dashboard'
        return NextResponse.redirect(url)
      }
      // If no member, allow access to onboarding to create one
    } catch (error) {
      console.error('[Middleware] Error checking member for onboarding:', error)
      // Allow access to onboarding even on error
    }
  }

  // Protect dashboard routes - redirect to login if not authenticated
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/admin-dashboard')) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Protect admin routes - redirect non-admins
  if (pathname.startsWith('/admin-dashboard') && user) {
    try {
      const { data: member } = await supabase
        .from('members')
        .select('is_admin')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!member || !member.is_admin) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('[Middleware] Error checking admin status:', error)
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
