import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MemberSidebar from '@/components/member/member-sidebar'
import MemberTopBar from '@/components/member/member-topbar'

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
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get member data
  const { data: member } = await supabase
    .from('members')
    .select('id, first_name, last_name, phone_number, is_admin')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    redirect('/onboarding')
  }

  // Add email and tier from auth user (since members table doesn't have these)
  const memberWithAuth = {
    ...member,
    email: user.email || '',
    tier: 'free', // Default tier
    avatar_url: null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <MemberSidebar member={memberWithAuth} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <MemberTopBar member={memberWithAuth} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
