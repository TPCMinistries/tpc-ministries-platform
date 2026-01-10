// IndexedDB utility for offline data storage

const DB_NAME = 'tpc-ministries-offline'
const DB_VERSION = 1

interface OfflineStore {
  name: string
  keyPath: string
  indexes?: { name: string; keyPath: string; unique?: boolean }[]
}

const STORES: OfflineStore[] = [
  {
    name: 'devotionals',
    keyPath: 'id',
    indexes: [{ name: 'date', keyPath: 'date', unique: true }]
  },
  {
    name: 'journal_entries',
    keyPath: 'id',
    indexes: [
      { name: 'date', keyPath: 'created_at' },
      { name: 'synced', keyPath: 'synced' }
    ]
  },
  {
    name: 'prayer_requests',
    keyPath: 'id',
    indexes: [
      { name: 'synced', keyPath: 'synced' },
      { name: 'status', keyPath: 'status' }
    ]
  },
  {
    name: 'daily_checkins',
    keyPath: 'id',
    indexes: [
      { name: 'date', keyPath: 'checkin_date', unique: true },
      { name: 'synced', keyPath: 'synced' }
    ]
  },
  {
    name: 'cached_content',
    keyPath: 'id',
    indexes: [
      { name: 'type', keyPath: 'type' },
      { name: 'cached_at', keyPath: 'cached_at' }
    ]
  },
  {
    name: 'pending_actions',
    keyPath: 'id',
    indexes: [
      { name: 'action_type', keyPath: 'action_type' },
      { name: 'created_at', keyPath: 'created_at' }
    ]
  }
]

class OfflineDB {
  private db: IDBDatabase | null = null
  private dbPromise: Promise<IDBDatabase> | null = null

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db
    if (this.dbPromise) return this.dbPromise

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not supported'))
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        STORES.forEach((store) => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, {
              keyPath: store.keyPath,
              autoIncrement: store.keyPath === 'id'
            })

            store.indexes?.forEach((index) => {
              objectStore.createIndex(index.name, index.keyPath, {
                unique: index.unique || false
              })
            })
          }
        })
      }
    })

    return this.dbPromise
  }

  async add<T>(storeName: string, data: T): Promise<IDBValidKey> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async put<T>(storeName: string, data: T): Promise<IDBValidKey> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: IDBValidKey
  ): Promise<T[]> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async count(storeName: string): Promise<number> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.count()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}

// Singleton instance
export const offlineDB = new OfflineDB()

// Helper functions for specific use cases

export async function cacheDevotional(devotional: any): Promise<void> {
  await offlineDB.put('devotionals', {
    ...devotional,
    cached_at: new Date().toISOString()
  })
}

export async function getCachedDevotional(date: string): Promise<any> {
  const results = await offlineDB.getByIndex('devotionals', 'date', date)
  return results[0]
}

export async function saveOfflineJournalEntry(entry: any): Promise<IDBValidKey> {
  return offlineDB.put('journal_entries', {
    ...entry,
    id: entry.id || `offline-${Date.now()}`,
    synced: false,
    created_at: entry.created_at || new Date().toISOString()
  })
}

export async function getUnsyncedJournalEntries(): Promise<any[]> {
  return offlineDB.getByIndex('journal_entries', 'synced', false)
}

export async function markJournalEntrySynced(id: string): Promise<void> {
  const entry = await offlineDB.get('journal_entries', id)
  if (entry) {
    await offlineDB.put('journal_entries', { ...entry, synced: true })
  }
}

export async function saveOfflinePrayerRequest(prayer: any): Promise<IDBValidKey> {
  return offlineDB.put('prayer_requests', {
    ...prayer,
    id: prayer.id || `offline-${Date.now()}`,
    synced: false,
    created_at: prayer.created_at || new Date().toISOString()
  })
}

export async function getUnsyncedPrayerRequests(): Promise<any[]> {
  return offlineDB.getByIndex('prayer_requests', 'synced', false)
}

export async function saveOfflineCheckin(checkin: any): Promise<IDBValidKey> {
  return offlineDB.put('daily_checkins', {
    ...checkin,
    id: checkin.id || `offline-${Date.now()}`,
    synced: false,
    checkin_date: checkin.checkin_date || new Date().toISOString().split('T')[0]
  })
}

export async function getUnsyncedCheckins(): Promise<any[]> {
  return offlineDB.getByIndex('daily_checkins', 'synced', false)
}

export async function queueOfflineAction(
  actionType: string,
  payload: any
): Promise<IDBValidKey> {
  return offlineDB.add('pending_actions', {
    id: `action-${Date.now()}`,
    action_type: actionType,
    payload,
    created_at: new Date().toISOString()
  })
}

export async function getPendingActions(): Promise<any[]> {
  return offlineDB.getAll('pending_actions')
}

export async function removePendingAction(id: string): Promise<void> {
  return offlineDB.delete('pending_actions', id)
}

export async function cacheContent(type: string, id: string, content: any): Promise<void> {
  await offlineDB.put('cached_content', {
    id: `${type}-${id}`,
    type,
    content,
    cached_at: new Date().toISOString()
  })
}

export async function getCachedContent(type: string, id: string): Promise<any> {
  const result = await offlineDB.get('cached_content', `${type}-${id}`)
  return result?.content
}

export async function clearOldCache(maxAgeDays: number = 7): Promise<void> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays)

  const allCached = await offlineDB.getAll<any>('cached_content')
  for (const item of allCached) {
    if (new Date(item.cached_at) < cutoffDate) {
      await offlineDB.delete('cached_content', item.id)
    }
  }
}
