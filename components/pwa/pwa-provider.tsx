'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X, RefreshCw } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  setWaitingWorker(newWorker)
                  setShowUpdateBanner(true)
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('SW registration failed:', error)
        })

      // Handle controller change (when new SW takes over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)

      // Show banner after a delay (don't interrupt initial experience)
      setTimeout(() => {
        // Check if already installed or dismissed
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (!dismissed) {
          setShowInstallBanner(true)
        }
      }, 30000) // Show after 30 seconds
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('Running as installed PWA')
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return

    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('User accepted install')
      } else {
        console.log('User dismissed install')
      }

      setInstallPrompt(null)
      setShowInstallBanner(false)
    } catch (error) {
      console.error('Install error:', error)
    }
  }

  const dismissInstallBanner = () => {
    setShowInstallBanner(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    }
    setShowUpdateBanner(false)
  }

  return (
    <>
      {children}

      {/* Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-navy text-white rounded-xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="h-6 w-6 text-gold" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Install TPC Ministries</h3>
              <p className="text-sm text-white/70 mb-3">
                Add to your home screen for quick access and offline features
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="bg-gold hover:bg-gold/90 text-navy"
                >
                  Install
                </Button>
                <Button
                  onClick={dismissInstallBanner}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Not now
                </Button>
              </div>
            </div>
            <button
              onClick={dismissInstallBanner}
              className="text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Update Banner */}
      {showUpdateBanner && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-green-600 text-white rounded-xl shadow-2xl p-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Update Available</h3>
              <p className="text-sm text-white/80 mb-3">
                A new version of TPC Ministries is ready
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  className="bg-white hover:bg-white/90 text-green-600"
                >
                  Update Now
                </Button>
                <Button
                  onClick={() => setShowUpdateBanner(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Later
                </Button>
              </div>
            </div>
            <button
              onClick={() => setShowUpdateBanner(false)}
              className="text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
