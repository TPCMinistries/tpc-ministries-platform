'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Calendar, DollarSign, BookOpen, Settings, LogOut, Heart, Library } from 'lucide-react'
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Prayers', href: '/my-prayers', icon: Heart },
  { name: 'My Library', href: '/library', icon: Library },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Giving', href: '/my-giving', icon: DollarSign },
  { name: 'Resources', href: '/resources', icon: BookOpen },
  { name: 'Settings', href: '/member-settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-navy border-r border-gray-700">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-700 bg-navy-900">
        <h1 className="text-2xl font-bold text-gold">TPC Ministries</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gold text-navy'
                  : 'text-gray-300 hover:bg-navy-800 hover:text-gold'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-gray-700 p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-red-900/20 hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
