"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Bell, Check, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  title: string
  message?: string
  link?: string
  isRead: boolean
  createdAt: string
}

interface NotificationBellProps {
  notifications: Notification[]
  unreadCount?: number
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  onDismiss?: (id: string) => void
  className?: string
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  if (seconds < 3600) return Math.floor(seconds / 60) + "m ago"
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago"
  if (seconds < 604800) return Math.floor(seconds / 86400) + "d ago"
  return date.toLocaleDateString()
}

const typeIcons: Record<string, string> = {
  prophecy: "sparkles",
  prayer: "heart",
  message: "message-square",
  event: "calendar",
  teaching: "book-open",
  donation: "gift",
  achievement: "trophy",
}

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  className,
}: NotificationBellProps) {
  const [open, setOpen] = React.useState(false)
  const count = unreadCount ?? notifications.filter(n => !n.isRead).length
  const shouldReduceMotion = useReducedMotion()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                initial={shouldReduceMotion ? undefined : { scale: 0 }}
                animate={shouldReduceMotion ? undefined : { scale: 1 }}
                exit={shouldReduceMotion ? undefined : { scale: 0 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full"
              >
                {count > 99 ? "99+" : count}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {count > 0 && onMarkAllRead && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={onMarkAllRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative group px-4 py-3 hover:bg-muted/50 transition-colors",
                    !notification.isRead && "bg-blue-50/50 dark:bg-blue-900/10"
                  )}
                >
                  {!notification.isRead && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                  )}
                  
                  <Link
                    href={notification.link || "#"}
                    onClick={() => {
                      if (!notification.isRead) {
                        onMarkRead?.(notification.id)
                      }
                      setOpen(false)
                    }}
                    className="block"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm line-clamp-1",
                          !notification.isRead && "font-medium"
                        )}>
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      
                      {onDismiss && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Dismiss notification"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onDismiss(notification.id)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full justify-center text-sm"
              asChild
            >
              <Link href="/notifications" onClick={() => setOpen(false)}>
                View all notifications
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
