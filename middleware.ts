import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // FIRST: Redirect ALL old /member/* routes to their correct paths (route groups don't appear in URL)
  // This must happen before ANY other logic, including session updates
  if (pathname.startsWith('/member/')) {
    console.log('[Middleware] Redirecting /member/* path:', pathname)
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
      console.log('[Middleware] Redirecting', pathname, 'to', mappedPath)
      const url = new URL(mappedPath, request.url)
      const redirect = NextResponse.redirect(url, 308) // 308 = permanent redirect
      redirect.headers.set('X-Redirect-From', pathname)
      redirect.headers.set('X-Redirect-To', mappedPath)
      return redirect
    }
    
    // If it's a /member/* path but not in our map, redirect to dashboard
    console.log('[Middleware] Redirecting unknown /member/* path to /dashboard')
    const url = new URL('/dashboard', request.url)
    const redirect = NextResponse.redirect(url, 308)
    redirect.headers.set('X-Redirect-From', pathname)
    redirect.headers.set('X-Redirect-To', '/dashboard')
    return redirect
  }

  // Update session first - this ensures cookies are properly set and session is refreshed
  let response = await updateSession(request)

  // Create supabase client for auth checks (using the response from updateSession)
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
