"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { 
  LayoutDashboard, MessageSquare, FileText, Users, BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  matchPaths: string[]
  badge?: number
}

interface AdminBottomNavProps {
  unreadMessages?: number
}

export function AdminBottomNav({ unreadMessages = 0 }: AdminBottomNavProps) {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  const navItems: NavItem[] = [
    {
      label: "Home",
      href: "/admin-dashboard",
      icon: LayoutDashboard,
      matchPaths: ["/admin-dashboard"],
    },
    {
      label: "Comms",
      href: "/admin-inbox",
      icon: MessageSquare,
      matchPaths: ["/admin-inbox", "/admin-emails", "/admin-sms"],
      badge: unreadMessages,
    },
    {
      label: "Content",
      href: "/admin-sermons",
      icon: FileText,
      matchPaths: ["/admin-sermons", "/admin-resources", "/admin-prophecy", "/admin-gallery"],
    },
    {
      label: "People",
      href: "/admin-members",
      icon: Users,
      matchPaths: ["/admin-members", "/admin-groups", "/admin-prayers", "/admin-events"],
    },
    {
      label: "Reports",
      href: "/analytics",
      icon: BarChart3,
      matchPaths: ["/analytics", "/admin-giving", "/admin-reports", "/admin-ai-insights"],
    },
  ]

  const isActive = (item: NavItem) => {
    if (pathname === item.href) return true
    return item.matchPaths.some(path => pathname.startsWith(path))
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-tpc-navy border-t border-white/10 lg:hidden">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full",
                "transition-colors duration-200",
                active 
                  ? "text-tpc-gold" 
                  : "text-white/60"
              )}
            >
              {active && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : "adminBottomNavIndicator"}
                  className="absolute -top-0.5 w-12 h-1 bg-tpc-gold rounded-full"
                  transition={shouldReduceMotion ? undefined : { type: "spring", duration: 0.5 }}
                />
              )}

              <div className="relative">
                <motion.div
                  animate={shouldReduceMotion ? undefined : (active ? { scale: 1.1 } : { scale: 1 })}
                  transition={shouldReduceMotion ? undefined : { type: "spring", stiffness: 500 }}
                >
                  <Icon className="h-5 w-5 mb-1" />
                </motion.div>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              
              <span className="text-[10px] font-medium">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
      
      <div className="h-safe-area-inset-bottom bg-tpc-navy" />
    </nav>
  )
}
