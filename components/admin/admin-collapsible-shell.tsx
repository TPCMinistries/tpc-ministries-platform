'use client'

import { useState, createContext, useContext } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { PanelLeftClose, PanelLeft } from 'lucide-react'

interface SidebarContextValue {
  collapsed: boolean
}

const SidebarContext = createContext<SidebarContextValue>({ collapsed: false })

export function useSidebarCollapsed() {
  return useContext(SidebarContext)
}

interface AdminCollapsibleShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

const sidebarVariants = {
  expanded: { width: 256 },
  collapsed: { width: 64 },
}

const mainVariants = {
  expanded: { marginLeft: 256 },
  collapsed: { marginLeft: 64 },
}

export function AdminCollapsibleShell({ sidebar, children }: AdminCollapsibleShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 300, damping: 30 }

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <div className="flex h-screen bg-background">
        {/* Sidebar - only visible on desktop (lg+), collapsible */}
        <motion.aside
          initial={false}
          animate={collapsed ? 'collapsed' : 'expanded'}
          variants={sidebarVariants}
          transition={transition}
          className="bg-navy border-r border-navy-800 flex-shrink-0 hidden lg:block fixed inset-y-0 left-0 z-40 overflow-hidden"
        >
          <div className="flex flex-col h-full w-64">
            {sidebar}
          </div>
        </motion.aside>

        {/* Main Content */}
        <motion.main
          initial={false}
          animate={collapsed ? 'collapsed' : 'expanded'}
          variants={mainVariants}
          transition={transition}
          className="flex-1 overflow-y-auto pb-20 lg:pb-0 relative hidden lg:block"
        >
          {/* Toggle button */}
          <motion.button
            onClick={() => setCollapsed((prev) => !prev)}
            animate={{ left: collapsed ? 72 : 264 }}
            transition={transition}
            className="fixed top-4 z-50 items-center justify-center h-8 w-8 rounded-md bg-card/80 backdrop-blur border border-border shadow-sm hover:bg-card hover:shadow-md transition-colors hidden lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4 text-muted-foreground" />
            ) : (
              <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
            )}
          </motion.button>
          {children}
        </motion.main>

        {/* Mobile layout (no sidebar animation needed) */}
        <main className="flex-1 overflow-y-auto pb-20 lg:hidden">
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  )
}
