import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MemberSidebar from '@/components/member/member-sidebar'
import MemberTopBar from '@/components/member/member-topbar'
import MobileBottomNav from '@/components/member/mobile-bottom-nav'

// Force dynamic rendering for all member pages
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  // Get member data including role
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id, first_name, last_name, phone_number, is_admin, role, tier')
    .eq('user_id', user.id)
    .maybeSingle()

  // If no member record exists (and no error), redirect to onboarding
  // This should only happen if the onboarding API failed
  if (!member && !memberError) {
    redirect('/onboarding')
  }

  // If there's an error querying, redirect to onboarding to retry
  if (memberError) {
    console.error('[MemberLayout] Error fetching member:', memberError)
    redirect('/onboarding')
  }

  // If member is null at this point, something went wrong - redirect to onboarding
  if (!member) {
    redirect('/onboarding')
  }

  // Add email and ensure role is set (fallback for backward compatibility)
  const memberWithAuth = {
    ...member,
    email: user.email || '',
    // Use role field, fallback to is_admin check, then tier, then 'free'
    role: member.role || (member.is_admin ? 'admin' : member.tier || 'free'),
    tier: member.tier || 'free',
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <MemberSidebar member={memberWithAuth} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <MemberTopBar member={memberWithAuth} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
