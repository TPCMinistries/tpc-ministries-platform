import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  // FIRST: Redirect old /member/* routes to their correct paths (route groups don't appear in URL)
  // This must happen before auth checks
  if (request.nextUrl.pathname.startsWith('/member/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }
  if (request.nextUrl.pathname.startsWith('/member/')) {
    // Map other /member/* routes to their actual paths
    const memberRouteMap: Record<string, string> = {
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
    }
    
    const mappedPath = memberRouteMap[request.nextUrl.pathname]
    if (mappedPath) {
      const url = request.nextUrl.clone()
      url.pathname = mappedPath
      return NextResponse.redirect(url)
    }
  }

  // Update session
  const response = await updateSession(request)

  // Check if the request is for a protected member route (old /member paths - should be rare now)
  if (request.nextUrl.pathname.startsWith('/member')) {
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

    // If no user is logged in, redirect to login
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  // If user is logged in and trying to access auth pages, redirect to appropriate dashboard
  if (request.nextUrl.pathname.startsWith('/auth')) {
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
        .single()

      const url = request.nextUrl.clone()
      
      if (member) {
        // Member exists - redirect to appropriate dashboard
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
