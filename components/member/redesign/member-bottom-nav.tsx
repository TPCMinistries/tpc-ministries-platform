"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { 
  Sun, BookOpen, Users, User, 
  Home, Heart, Sparkles, Calendar,
  MoreHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  activeIcon?: React.ElementType
  matchPaths?: string[]
}

const navItems: NavItem[] = [
  {
    label: "Today",
    href: "/dashboard",
    icon: Sun,
    matchPaths: ["/dashboard", "/journal", "/daily"],
  },
  {
    label: "Grow",
    href: "/library",
    icon: BookOpen,
    matchPaths: ["/library", "/learning", "/my-prophecies", "/assessments"],
  },
  {
    label: "Connect",
    href: "/prayer",
    icon: Heart,
    matchPaths: ["/prayer", "/groups", "/events", "/connections"],
  },
  {
    label: "You",
    href: "/account",
    icon: User,
    matchPaths: ["/account", "/my-giving", "/my-journey", "/settings"],
  },
]

export function MemberBottomNav() {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  const isActive = (item: NavItem) => {
    if (pathname === item.href) return true
    if (item.matchPaths?.some(path => pathname.startsWith(path))) return true
    return false
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden">
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
                  ? "text-tpc-navy dark:text-tpc-gold" 
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              {active && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : "bottomNavIndicator"}
                  className="absolute -top-0.5 w-12 h-1 bg-tpc-gold rounded-full"
                  transition={shouldReduceMotion ? undefined : { type: "spring", duration: 0.5 }}
                />
              )}

              <motion.div
                animate={shouldReduceMotion ? undefined : (active ? { scale: 1.1 } : { scale: 1 })}
                transition={shouldReduceMotion ? undefined : { type: "spring", stiffness: 500 }}
              >
                <Icon className={cn(
                  "h-5 w-5 mb-1",
                  active && "text-tpc-gold"
                )} />
              </motion.div>
              
              <span className={cn(
                "text-xs font-medium",
                active && "text-tpc-navy dark:text-tpc-gold"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  )
}
