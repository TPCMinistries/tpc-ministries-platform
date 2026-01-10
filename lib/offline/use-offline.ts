'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  offlineDB,
  getUnsyncedJournalEntries,
  getUnsyncedPrayerRequests,
  getUnsyncedCheckins,
  getPendingActions,
  removePendingAction,
  markJournalEntrySynced
} from './indexed-db'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export function useOfflineSync() {
  const isOnline = useOnlineStatus()
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  const countPendingItems = useCallback(async () => {
    try {
      const [journals, prayers, checkins, actions] = await Promise.all([
        getUnsyncedJournalEntries(),
        getUnsyncedPrayerRequests(),
        getUnsyncedCheckins(),
        getPendingActions()
      ])
      setPendingCount(journals.length + prayers.length + checkins.length + actions.length)
    } catch (error) {
      console.error('Error counting pending items:', error)
    }
  }, [])

  const syncAll = useCallback(async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    try {
      // Sync journal entries
      const journals = await getUnsyncedJournalEntries()
      for (const entry of journals) {
        try {
          const res = await fetch('/api/journal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
          })
          if (res.ok) {
            await markJournalEntrySynced(entry.id)
          }
        } catch (e) {
          console.error('Failed to sync journal entry:', e)
        }
      }

      // Sync prayer requests
      const prayers = await getUnsyncedPrayerRequests()
      for (const prayer of prayers) {
        try {
          const res = await fetch('/api/prayer/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prayer)
          })
          if (res.ok) {
            await offlineDB.put('prayer_requests', { ...prayer, synced: true })
          }
        } catch (e) {
          console.error('Failed to sync prayer request:', e)
        }
      }

      // Sync check-ins
      const checkins = await getUnsyncedCheckins()
      for (const checkin of checkins) {
        try {
          const res = await fetch('/api/daily-checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkin)
          })
          if (res.ok) {
            await offlineDB.put('daily_checkins', { ...checkin, synced: true })
          }
        } catch (e) {
          console.error('Failed to sync check-in:', e)
        }
      }

      // Process pending actions
      const actions = await getPendingActions()
      for (const action of actions) {
        try {
          const res = await fetch(`/api/${action.action_type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.payload)
          })
          if (res.ok) {
            await removePendingAction(action.id)
          }
        } catch (e) {
          console.error('Failed to process pending action:', e)
        }
      }

      setLastSyncTime(new Date())
      await countPendingItems()
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing, countPendingItems])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      syncAll()
    }
  }, [isOnline, syncAll])

  // Count pending items on mount
  useEffect(() => {
    countPendingItems()
  }, [countPendingItems])

  // Register for background sync if supported
  useEffect(() => {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        // Register sync tags
        registration.sync?.register('sync-all').catch(console.error)
      })
    }
  }, [])

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTime,
    syncAll,
    countPendingItems
  }
}

export function useOfflineData<T>(
  storeName: string,
  onlineUrl: string,
  options?: {
    cacheKey?: string
    maxAge?: number // in minutes
  }
) {
  const isOnline = useOnlineStatus()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (isOnline) {
        // Try to fetch from network first
        const res = await fetch(onlineUrl)
        if (res.ok) {
          const result = await res.json()
          setData(result)
          setIsFromCache(false)

          // Cache the result
          if (options?.cacheKey) {
            await offlineDB.put(storeName, {
              id: options.cacheKey,
              data: result,
              cached_at: new Date().toISOString()
            })
          }
          return
        }
      }

      // Fall back to cached data
      if (options?.cacheKey) {
        const cached = await offlineDB.get<any>(storeName, options.cacheKey)
        if (cached) {
          // Check if cache is still valid
          if (options.maxAge) {
            const cachedAt = new Date(cached.cached_at)
            const maxAgeMs = options.maxAge * 60 * 1000
            if (Date.now() - cachedAt.getTime() < maxAgeMs) {
              setData(cached.data)
              setIsFromCache(true)
              return
            }
          } else {
            setData(cached.data)
            setIsFromCache(true)
            return
          }
        }
      }

      if (!isOnline) {
        setError('You are offline. Some data may not be available.')
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')

      // Try cache as last resort
      if (options?.cacheKey) {
        const cached = await offlineDB.get<any>(storeName, options.cacheKey)
        if (cached) {
          setData(cached.data)
          setIsFromCache(true)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [isOnline, onlineUrl, storeName, options?.cacheKey, options?.maxAge])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, isFromCache, refetch: fetchData }
}
