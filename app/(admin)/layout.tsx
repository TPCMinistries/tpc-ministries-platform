import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/admin-nav'

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

  // Check if user has admin role
  const { data: member, error } = await supabase
    .from('members')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (error || !member || !member.is_admin) {
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
