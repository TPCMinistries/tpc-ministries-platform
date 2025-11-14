// Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  if (!event.data) return

  const data = event.data.json()
  const title = data.title || 'TPC Ministries'
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag || 'notification',
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  const url = event.notification.data.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', function(event) {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then(function(subscription) {
        // Send new subscription to server
        return fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        })
      })
  )
})
