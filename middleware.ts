import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

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

  // Update session
  const response = await updateSession(request)

  // If user is logged in and trying to access auth pages, redirect to appropriate dashboard
  if (pathname.startsWith('/auth')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check if member record exists
      const { data: member } = await supabase
        .from('members')
        .select('is_admin')
        .eq('user_id', user.id)
        .maybeSingle()

      const url = request.nextUrl.clone()
      
      if (member) {
        // Member exists - redirect to appropriate dashboard (admins go to admin dashboard)
        url.pathname = member.is_admin ? '/admin-dashboard' : '/dashboard'
      } else {
        // No member record - redirect to onboarding
        url.pathname = '/onboarding'
      }
      
      return NextResponse.redirect(url)
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
