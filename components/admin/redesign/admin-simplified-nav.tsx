"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, MessageSquare, FileText, Users, BarChart3,
  Mail, Inbox, Send, Megaphone,
  Video, BookOpen, Sparkles, Image, FileDown, PenSquare,
  UserPlus, Heart, Calendar, UsersRound,
  DollarSign, TrendingUp, Brain, Settings,
  ChevronDown, ChevronRight, ExternalLink, Bell,
  Home, Menu, X, Plane
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

interface NavSection {
  id: string
  label: string
  icon: React.ElementType
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    id: "communicate",
    label: "Communicate",
    icon: MessageSquare,
    items: [
      { label: "Inbox", href: "/admin-inbox", icon: Inbox },
      { label: "Email Campaigns", href: "/admin-emails", icon: Mail },
      { label: "SMS Campaigns", href: "/admin-sms", icon: Send },
      { label: "Announcements", href: "/admin-announcements", icon: Megaphone },
    ]
  },
  {
    id: "content",
    label: "Content",
    icon: FileText,
    items: [
      { label: "Content Hub", href: "/content-hub", icon: PenSquare },
      { label: "Teachings", href: "/admin-sermons", icon: Video },
      { label: "Resources", href: "/admin-resources", icon: FileDown },
      { label: "Prophecy Hub", href: "/admin-prophecy", icon: Sparkles },
      { label: "Gallery", href: "/admin-gallery", icon: Image },
      { label: "Blog", href: "/admin-blog", icon: BookOpen },
    ]
  },
  {
    id: "people",
    label: "People",
    icon: Users,
    items: [
      { label: "Members", href: "/admin-members", icon: UsersRound },
      { label: "Groups", href: "/admin-groups", icon: Users },
      { label: "Prayer Requests", href: "/admin-prayers", icon: Heart },
      { label: "Events", href: "/admin-events", icon: Calendar },
      { label: "Kenya 2026", href: "/kenya-command-center", icon: UserPlus },
    ]
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    items: [
      { label: "Analytics", href: "/analytics", icon: TrendingUp },
      { label: "Giving", href: "/admin-giving", icon: DollarSign },
      { label: "AI Insights", href: "/admin-ai-insights", icon: Brain },
      { label: "Reports", href: "/admin-reports", icon: BarChart3 },
    ]
  },
]

interface AdminSimplifiedNavProps {
  unreadMessages?: number
  newLeads?: number
}

export function AdminSimplifiedNav({ unreadMessages = 0, newLeads = 0 }: AdminSimplifiedNavProps) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = React.useState<string[]>(["communicate"])
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  // Auto-expand section containing current page
  React.useEffect(() => {
    const currentSection = navSections.find(section => 
      section.items.some(item => isActive(item.href))
    )
    if (currentSection && !expandedSections.includes(currentSection.id)) {
      setExpandedSections(prev => [...prev, currentSection.id])
    }
  }, [pathname])

  const NavContent = () => (
    <>
      {/* Logo & Brand */}
      <div className="p-4 border-b border-white/10">
        <Link href="/admin-dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-tpc-gold flex items-center justify-center">
            <span className="text-tpc-navy font-bold text-lg">T</span>
          </div>
          <div>
            <h1 className="font-semibold text-white">TPC Admin</h1>
            <p className="text-xs text-white/60">Command Center</p>
          </div>
        </Link>
      </div>

      {/* Switch to Member Portal */}
      <div className="p-4 border-b border-white/10">
        <Button asChild variant="outline" className="w-full bg-gradient-to-r from-tpc-gold to-tpc-gold-dark text-tpc-navy border-0 hover:opacity-90">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Member Portal
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Link>
        </Button>
      </div>

      {/* Main Dashboard Link */}
      <div className="p-2 space-y-1">
        <Link
          href="/admin-dashboard"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            isActive("/admin-dashboard")
              ? "bg-white/10 text-white"
              : "text-white/70 hover:bg-white/5 hover:text-white"
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link
          href="/kenya-command-center"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            isActive("/kenya-command-center")
              ? "bg-green-600/30 text-green-300"
              : "text-white/70 hover:bg-green-600/10 hover:text-green-300"
          )}
        >
          <Plane className="h-5 w-5" />
          <span className="font-medium">Kenya 2026</span>
        </Link>
      </div>

      {/* Navigation Sections */}
      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-1 py-2">
          {navSections.map((section) => {
            const isExpanded = expandedSections.includes(section.id)
            const SectionIcon = section.icon
            const hasActiveItem = section.items.some(item => isActive(item.href))
            
            // Calculate badges for section
            let sectionBadge = 0
            if (section.id === "communicate" && unreadMessages > 0) sectionBadge = unreadMessages
            if (section.id === "people" && newLeads > 0) sectionBadge = newLeads

            return (
              <div key={section.id} className="mb-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                    hasActiveItem
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <SectionIcon className="h-5 w-5" />
                  <span className="font-medium flex-1">{section.label}</span>
                  {sectionBadge > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
                      {sectionBadge}
                    </Badge>
                  )}
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-4">
                        {section.items.map((item) => {
                          const ItemIcon = item.icon
                          const itemBadge = item.href === "/admin-inbox" ? unreadMessages : 0
                          
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                isActive(item.href)
                                  ? "bg-tpc-gold/20 text-tpc-gold"
                                  : "text-white/60 hover:bg-white/5 hover:text-white"
                              )}
                            >
                              <ItemIcon className="h-4 w-4" />
                              <span className="flex-1">{item.label}</span>
                              {itemBadge > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
                                  {itemBadge}
                                </Badge>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Settings Footer */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/admin-settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            isActive("/admin-settings")
              ? "bg-white/10 text-white"
              : "text-white/70 hover:bg-white/5 hover:text-white"
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-tpc-navy">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-tpc-navy h-14 flex items-center px-4 border-b border-white/10">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="text-white p-2 -ml-2"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="ml-3 font-semibold text-white">TPC Admin</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadMessages > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-tpc-navy z-50 flex flex-col"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6" />
              </button>
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
