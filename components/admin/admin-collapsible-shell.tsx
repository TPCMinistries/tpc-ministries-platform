'use client'

import { useState } from 'react'
import { PanelLeftClose, PanelLeft } from 'lucide-react'

interface AdminCollapsibleShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

export function AdminCollapsibleShell({ sidebar, children }: AdminCollapsibleShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Sidebar - only visible on desktop (lg+), collapsible */}
      <aside
        className={`${
          collapsed ? 'w-0 overflow-hidden' : 'w-64'
        } bg-navy border-r border-gray-700 transition-all duration-300 flex-shrink-0 hidden lg:block`}
      >
        <div className="flex flex-col h-full w-64">
          {sidebar}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 relative">
        {/* Toggle button - only visible on desktop */}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="hidden lg:flex fixed top-4 left-4 z-50 items-center justify-center h-8 w-8 rounded-md bg-white/80 backdrop-blur border border-gray-200 shadow-sm hover:bg-white hover:shadow-md transition-all"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4 text-gray-600" />
          ) : (
            <PanelLeftClose className="h-4 w-4 text-gray-600" />
          )}
        </button>
        {children}
      </main>
    </div>
  )
}
