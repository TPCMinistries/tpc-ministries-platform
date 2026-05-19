import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/onboarding'
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, origin))
    }
  }

  // For OAuth flows (Google, etc.), check if user is authenticated
  // and redirect to appropriate destination
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Check if user has a member record
    const { data: member } = await supabase
      .from('members')
      .select('id, role, is_admin')
      .eq('user_id', user.id)
      .maybeSingle()

    // Staff/admin always lands on admin dashboard, regardless of ?next=
    if (member && (member.role === 'staff' || member.role === 'admin' || member.is_admin)) {
      return NextResponse.redirect(new URL('/admin-dashboard', origin))
    }

    // Honor ?next= for deep-link signups (AI handoff, post-assessment, etc.)
    // Only allow same-origin paths starting with / to prevent open-redirect.
    if (next && next.startsWith('/') && !next.startsWith('//')) {
      return NextResponse.redirect(new URL(next, origin))
    }

    // Default destinations by member existence
    return NextResponse.redirect(
      new URL(member ? '/dashboard' : '/onboarding', origin)
    )
  }

  // No authenticated user — honor next or fall through
  return NextResponse.redirect(new URL(next, origin))
}

