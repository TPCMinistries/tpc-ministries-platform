import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Update session first - this is critical for auth to work
  let response = await updateSession(request)

  // For /member/* routes, let the page files handle it - don't interfere
  if (pathname.startsWith('/member/')) {
    return response
  }

  // Create supabase client for auth checks (reuse response from updateSession)
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

  // Get user session - wrap in try/catch to prevent crashes
  let user = null
  try {
    const { data: { user: userData } } = await supabase.auth.getUser()
    user = userData
  } catch (error) {
    console.error('[Middleware] Error getting user:', error)
    // Continue without user - don't crash
  }

  // Only do auth checks if we have a user - wrap everything in try/catch
  if (user) {
    try {
      // If user is logged in and trying to access auth pages, redirect to appropriate dashboard
      if (pathname.startsWith('/auth')) {
        const { data: member } = await supabase
          .from('members')
          .select('is_admin')
          .eq('user_id', user.id)
          .maybeSingle()

        if (member) {
          const url = request.nextUrl.clone()
          url.pathname = member.is_admin ? '/admin-dashboard' : '/dashboard'
          return NextResponse.redirect(url)
        }
      }

      // If user is logged in and on onboarding, check if they already have a member record
      if (pathname === '/onboarding') {
        const { data: member } = await supabase
          .from('members')
          .select('is_admin')
          .eq('user_id', user.id)
          .maybeSingle()

        if (member) {
          const url = request.nextUrl.clone()
          url.pathname = member.is_admin ? '/admin-dashboard' : '/dashboard'
          return NextResponse.redirect(url)
        }
      }

      // Protect admin routes - redirect non-admins
      if (pathname.startsWith('/admin-dashboard')) {
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
      }
    } catch (error) {
      // If any error occurs, log it but don't crash - just continue
      console.error('[Middleware] Error in auth checks:', error)
    }
  } else {
    // No user - protect dashboard routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin-dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
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
