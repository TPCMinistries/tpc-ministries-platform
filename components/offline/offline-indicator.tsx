'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw, CloudOff, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOfflineSync, useOnlineStatus } from '@/lib/offline/use-offline'
import { cn } from '@/lib/utils'

interface OfflineIndicatorProps {
  className?: string
  showSyncButton?: boolean
}

export default function OfflineIndicator({
  className,
  showSyncButton = true
}: OfflineIndicatorProps) {
  const isOnline = useOnlineStatus()
  const { isSyncing, pendingCount, syncAll, lastSyncTime } = useOfflineSync()
  const [showBanner, setShowBanner] = useState(false)
  const [justCameOnline, setJustCameOnline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true)
      setJustCameOnline(false)
    } else if (showBanner) {
      // Show "back online" message briefly
      setJustCameOnline(true)
      const timer = setTimeout(() => {
        setShowBanner(false)
        setJustCameOnline(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, showBanner])

  if (!showBanner && pendingCount === 0) return null

  return (
    <div
      className={cn(
        'fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 transition-all duration-300',
        className
      )}
    >
      <div
        className={cn(
          'rounded-lg shadow-lg p-4 flex items-center gap-3',
          isOnline
            ? justCameOnline
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            : 'bg-amber-500 text-white'
        )}
      >
        {!isOnline ? (
          <>
            <WifiOff className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">You're offline</p>
              <p className="text-sm opacity-90">
                Changes will sync when you're back online
              </p>
            </div>
            {pendingCount > 0 && (
              <span className="bg-white/20 px-2 py-1 rounded text-sm">
                {pendingCount} pending
              </span>
            )}
          </>
        ) : justCameOnline ? (
          <>
            <Check className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium">Back online!</p>
          </>
        ) : pendingCount > 0 ? (
          <>
            <CloudOff className="h-5 w-5 flex-shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {pendingCount} items to sync
              </p>
              {lastSyncTime && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last sync: {lastSyncTime.toLocaleTimeString()}
                </p>
              )}
            </div>
            {showSyncButton && (
              <Button
                size="sm"
                onClick={syncAll}
                disabled={isSyncing}
                className="bg-navy hover:bg-navy/90"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Sync</span>
              </Button>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

// Compact version for topbar
export function OfflineStatusBadge() {
  const isOnline = useOnlineStatus()
  const { pendingCount, isSyncing } = useOfflineSync()

  if (isOnline && pendingCount === 0) return null

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        isOnline
          ? pendingCount > 0
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </>
      ) : isSyncing ? (
        <>
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Syncing...</span>
        </>
      ) : pendingCount > 0 ? (
        <>
          <CloudOff className="h-3 w-3" />
          <span>{pendingCount} pending</span>
        </>
      ) : (
        <>
          <Wifi className="h-3 w-3" />
          <span>Online</span>
        </>
      )}
    </div>
  )
}
