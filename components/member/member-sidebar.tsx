'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  User,
  Menu,
  X,
  Sparkles,
  MessageSquare,
  ClipboardList,
  Leaf,
  PenLine,
  Library,
  CalendarDays,
  Gift,
  Bot,
  Users,
  Radio,
  UserCheck,
  Sunrise,
  Shield,
  Plane,
  ChevronsLeft,
  ChevronsRight,
  type LucideIcon,
} from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import InstallButton from '@/components/pwa/install-button'

interface MemberSidebarProps {
  member: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
    tier?: string
    role?: string
    is_admin?: boolean
  }
}

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  badge?: number
  highlight?: boolean
  external?: boolean
}

interface NavSection {
  title: string | null
  items: NavItem[]
}

const COLLAPSED_KEY = 'tpc-sidebar-collapsed'

export default function MemberSidebar({ member }: MemberSidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const isStaffOrAdmin = member.role === 'admin' || member.role === 'staff' || member.is_admin === true

  const navigationSections: NavSection[] = [
    {
      title: null,
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: isStaffOrAdmin ? 'Admin Command Center' : 'Kenya 2026', href: isStaffOrAdmin ? '/admin-command-center' : '/kenya-trip', icon: Plane, highlight: true },
        { name: 'Messages', href: '/messages', icon: MessageSquare, badge: unreadCount },
        { name: 'Ask Prophet Lorenzo', href: '/ask-prophet-lorenzo', icon: Bot, highlight: true },
      ]
    },
    {
      title: 'Daily Walk',
      items: [
        { name: 'Streams of Grace', href: 'https://www.streamsofgrace.app', icon: Sunrise, highlight: true, external: true },
        { name: 'My Journal', href: '/journal', icon: PenLine },
      ]
    },
    {
      title: 'Learn & Grow',
      items: [
        { name: 'Library', href: '/library', icon: Library },
        { name: 'Learning Paths', href: '/learning', icon: Leaf },
        { name: 'My Assessments', href: '/my-assessments', icon: ClipboardList },
      ]
    },
    {
      title: 'Community',
      items: [
        { name: 'Groups', href: '/groups', icon: Users },
        { name: 'Connections', href: '/connections', icon: UserCheck },
        { name: 'Events', href: '/events', icon: CalendarDays },
        { name: 'Live Stream', href: '/live', icon: Radio },
      ]
    },
    {
      title: 'My Account',
      items: [
        { name: 'My Journey', href: '/my-journey', icon: Sparkles },
        { name: 'Giving', href: '/my-giving', icon: Gift },
        { name: 'Account', href: '/account', icon: User },
      ]
    },
  ]

  // Restore collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLLAPSED_KEY)
      if (saved !== null) {
        setIsCollapsed(saved === 'true')
      }
    } catch {
      // localStorage not available
    }
  }, [])

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem(COLLAPSED_KEY, String(next))
      } catch {
        // localStorage not available
      }
      return next
    })
  }, [])

  useEffect(() => {
    fetchUnreadCount()

    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [member.id])

  const fetchUnreadCount = async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('recipient_type', 'member')
        .eq('is_read', false)

      if (!error && count !== null) {
        setUnreadCount(count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  // Get role display info - uses role field primarily, falls back to tier
  const getRoleColor = (role?: string, tier?: string) => {
    const effectiveRole = role || tier || 'free'
    switch (effectiveRole) {
      case 'admin':
        return 'bg-gold/20 text-gold border-gold/30'
      case 'staff':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
      case 'partner':
      case 'covenant':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
      case 'member':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getRoleLabel = (role?: string, tier?: string) => {
    const effectiveRole = role || tier || 'free'
    switch (effectiveRole) {
      case 'admin':
        return 'Admin'
      case 'staff':
        return 'Staff'
      case 'partner':
      case 'covenant':
        return 'Partner'
      case 'member':
        return 'Member'
      default:
        return 'Free'
    }
  }

  // Avatar ring style based on tier
  const getAvatarRingClass = (role?: string, tier?: string) => {
    const effectiveRole = role || tier || 'free'
    switch (effectiveRole) {
      case 'partner':
      case 'covenant':
      case 'admin':
      case 'staff':
        return 'ring-2 ring-gold ring-offset-2 ring-offset-card'
      default:
        return 'ring-2 ring-navy ring-offset-2 ring-offset-card'
    }
  }

  // Check if user can access admin portal (staff or above)
  const canAccessAdmin = () => {
    const role = member.role || (member.is_admin ? 'admin' : 'free')
    return ['admin', 'staff'].includes(role)
  }

  const sidebarWidth = isCollapsed ? 64 : 256

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const mobileSlideVariants = {
    hidden: { x: '-100%' },
    visible: { x: 0 },
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-card shadow-lg border-border"
          aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay + sidebar with AnimatePresence */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {shouldReduceMotion ? (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsMobileOpen(false)}
              />
            ) : (
              <motion.div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsMobileOpen(false)}
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2 }}
              />
            )}
            {shouldReduceMotion ? (
              <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border lg:hidden">
                <SidebarContent
                  member={member}
                  pathname={pathname}
                  navigationSections={navigationSections}
                  unreadCount={unreadCount}
                  isCollapsed={false}
                  onToggleCollapse={toggleCollapsed}
                  onLinkClick={() => setIsMobileOpen(false)}
                  canAccessAdmin={canAccessAdmin}
                  getRoleColor={getRoleColor}
                  getRoleLabel={getRoleLabel}
                  getAvatarRingClass={getAvatarRingClass}
                  shouldReduceMotion={!!shouldReduceMotion}
                />
              </aside>
            ) : (
              <motion.aside
                className="fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border lg:hidden"
                variants={mobileSlideVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <SidebarContent
                  member={member}
                  pathname={pathname}
                  navigationSections={navigationSections}
                  unreadCount={unreadCount}
                  isCollapsed={false}
                  onToggleCollapse={toggleCollapsed}
                  onLinkClick={() => setIsMobileOpen(false)}
                  canAccessAdmin={canAccessAdmin}
                  getRoleColor={getRoleColor}
                  getRoleLabel={getRoleLabel}
                  getAvatarRingClass={getAvatarRingClass}
                  shouldReduceMotion={!!shouldReduceMotion}
                />
              </motion.aside>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      {shouldReduceMotion ? (
        <aside
          className={cn(
            'hidden lg:block relative inset-y-0 left-0 z-30 bg-card border-r border-border h-screen',
            isCollapsed ? 'w-16' : 'w-64'
          )}
        >
          <SidebarContent
            member={member}
            pathname={pathname}
            navigationSections={navigationSections}
            unreadCount={unreadCount}
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleCollapsed}
            onLinkClick={() => {}}
            canAccessAdmin={canAccessAdmin}
            getRoleColor={getRoleColor}
            getRoleLabel={getRoleLabel}
            getAvatarRingClass={getAvatarRingClass}
            shouldReduceMotion={true}
          />
        </aside>
      ) : (
        <motion.aside
          className="hidden lg:block relative inset-y-0 left-0 z-30 bg-card border-r border-border h-screen"
          animate={{ width: sidebarWidth }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <SidebarContent
            member={member}
            pathname={pathname}
            navigationSections={navigationSections}
            unreadCount={unreadCount}
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleCollapsed}
            onLinkClick={() => {}}
            canAccessAdmin={canAccessAdmin}
            getRoleColor={getRoleColor}
            getRoleLabel={getRoleLabel}
            getAvatarRingClass={getAvatarRingClass}
            shouldReduceMotion={false}
          />
        </motion.aside>
      )}
    </>
  )
}

// --- Inner sidebar content ---

interface SidebarContentProps {
  member: MemberSidebarProps['member']
  pathname: string
  navigationSections: NavSection[]
  unreadCount: number
  isCollapsed: boolean
  onToggleCollapse: () => void
  onLinkClick: () => void
  canAccessAdmin: () => boolean
  getRoleColor: (role?: string, tier?: string) => string
  getRoleLabel: (role?: string, tier?: string) => string
  getAvatarRingClass: (role?: string, tier?: string) => string
  shouldReduceMotion: boolean
}

function SidebarContent({
  member,
  pathname,
  navigationSections,
  unreadCount,
  isCollapsed,
  onToggleCollapse,
  onLinkClick,
  canAccessAdmin,
  getRoleColor,
  getRoleLabel,
  getAvatarRingClass,
  shouldReduceMotion,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-2 py-6 border-b border-border',
        isCollapsed ? 'px-3 justify-center' : 'px-6'
      )}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-navy-800 flex-shrink-0">
          <Sparkles className="h-6 w-6 text-gold" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-navy dark:text-foreground font-display">TPC Ministries</h1>
            <p className="text-xs text-muted-foreground">Member Portal</p>
          </div>
        )}
      </div>

      {/* Member Info */}
      <div className={cn(
        'py-4 border-b border-border',
        isCollapsed ? 'px-3 flex justify-center' : 'px-6'
      )}>
        <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-3')}>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white font-semibold flex-shrink-0',
              getAvatarRingClass(member.role, member.tier)
            )}
            title={isCollapsed ? `${member.first_name} ${member.last_name}` : undefined}
          >
            {member.first_name?.[0]}{member.last_name?.[0]}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {member.first_name} {member.last_name}
              </p>
              <Badge variant="outline" className={cn('text-xs mt-1', getRoleColor(member.role, member.tier))}>
                {getRoleLabel(member.role, member.tier)}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Main navigation">
        <div className="space-y-6">
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && !isCollapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              {section.title && isCollapsed && (
                <div className="h-px bg-border mx-2 mb-2" />
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = !item.external && (pathname === item.href || pathname.startsWith(item.href + '/'))
                  const LinkComponent = item.external ? 'a' : Link
                  const linkProps = item.external
                    ? { href: item.href, target: '_blank' as const, rel: 'noopener noreferrer' }
                    : { href: item.href }

                  return (
                    <li key={item.name} className="relative">
                      {/* Active indicator bar with layoutId for sliding animation */}
                      {isActive && !shouldReduceMotion && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gold"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      {isActive && shouldReduceMotion && (
                        <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gold" />
                      )}
                      <LinkComponent
                        {...linkProps}
                        onClick={onLinkClick}
                        title={isCollapsed ? item.name : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
                          isCollapsed ? 'px-0 py-2 justify-center' : 'px-3 py-2',
                          isActive
                            ? 'bg-navy/10 dark:bg-navy-200/10 text-navy dark:text-gold'
                            : item.highlight
                            ? 'bg-gradient-to-r from-gold/10 to-amber-100/50 dark:from-gold/15 dark:to-amber-900/20 text-amber-800 dark:text-amber-200 border border-gold/20 hover:from-gold/20 hover:to-amber-200/50 dark:hover:from-gold/25 dark:hover:to-amber-800/30'
                            : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5 flex-shrink-0",
                          item.highlight && !isActive && "text-gold"
                        )} />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1">{item.name}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                              <Badge className="bg-red-600 text-white text-xs px-2 py-0.5">
                                {item.badge}
                              </Badge>
                            )}
                            {item.external && (
                              <Badge className="bg-tpc-gold/80 text-white text-xs px-1.5 py-0">App</Badge>
                            )}
                            {item.highlight && !isActive && !item.external && (
                              <Badge className="bg-gold text-white text-xs px-1.5 py-0">AI</Badge>
                            )}
                          </>
                        )}
                        {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </LinkComponent>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Install App Button */}
      {!isCollapsed && (
        <div className="px-3 py-2 border-t border-border">
          <InstallButton variant="sidebar" />
        </div>
      )}

      {/* Admin Command Center Link - visible to staff and admins */}
      {canAccessAdmin() && (
        <div className={cn('py-4 border-t border-border', isCollapsed ? 'px-2' : 'px-3')}>
          <Link href="/admin-command-center" title={isCollapsed ? 'Admin Command Center' : undefined}>
            <Button className={cn(
              'bg-navy hover:bg-navy/90 text-white',
              isCollapsed ? 'w-10 h-10 p-0' : 'w-full'
            )}>
              <Shield className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
              {!isCollapsed && 'Admin Command'}
            </Button>
          </Link>
        </div>
      )}

      {/* Upgrade CTA (for free and member roles - not partners/staff/admin) */}
      {['free', 'member'].includes(member.role || member.tier || 'free') && !isCollapsed && (
        <div className="px-3 py-4 border-t border-border">
          <div className="bg-gradient-to-br from-gold/10 to-navy/10 dark:from-gold/20 dark:to-navy/20 rounded-lg p-4 border border-gold/20 animate-glow-pulse">
            <p className="text-sm font-semibold text-navy dark:text-foreground mb-2 font-display">Upgrade Your Journey</p>
            <p className="text-xs text-muted-foreground mb-3">
              Unlock exclusive content and prophetic words
            </p>
            <Link href="/partner">
              <Button size="sm" variant="gold" className="w-full">
                Become a Partner
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Collapse toggle (desktop only) */}
      <div className="hidden lg:block px-3 py-3 border-t border-border">
        <button
          onClick={onToggleCollapse}
          className={cn(
            'flex items-center gap-2 w-full rounded-lg py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors',
            isCollapsed ? 'justify-center px-0' : 'px-3'
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
