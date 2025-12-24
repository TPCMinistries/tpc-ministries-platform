import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/admin-nav'
import { ArrowLeftRight } from 'lucide-react'

// Force dynamic rendering for all admin pages
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLayout({
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

  // Check if user has admin or staff role
  const { data: member, error } = await supabase
    .from('members')
    .select('is_admin, role')
    .eq('user_id', user.id)
    .maybeSingle()

  // If no member record exists, redirect to onboarding
  if (!member && !error) {
    redirect('/onboarding')
  }

  // Check if user has staff or admin access (role-based or legacy is_admin)
  const hasAdminAccess = member?.role === 'admin' || member?.role === 'staff' || member?.is_admin === true

  // If there's an error or member doesn't have admin access, redirect
  if (error || !member || !hasAdminAccess) {
    // If member exists but no admin access, redirect to dashboard
    if (member && !hasAdminAccess) {
      redirect('/dashboard')
    }
    // Otherwise redirect to home
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-navy border-r border-gray-700">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold">
                <span className="text-lg font-bold text-navy">✝</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">TPC Ministries</h1>
                <p className="text-xs text-gray-400">Admin Portal</p>
              </div>
            </div>

            {/* Portal Switcher */}
            <div className="px-3 py-3 border-b border-gray-700">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 hover:to-amber-400 text-navy font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Switch to Member Portal
              </Link>
            </div>

            {/* Navigation */}
            <AdminNav />

            {/* User Info */}
            <div className="border-t border-gray-700 px-3 py-4">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-navy font-semibold text-sm">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Admin</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
