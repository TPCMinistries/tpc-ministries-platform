'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Share, Smartphone, Monitor, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallButtonProps {
  variant?: 'default' | 'sidebar' | 'compact' | 'banner'
  className?: string
}

export default function InstallButton({ variant = 'default', className }: InstallButtonProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Listen for install prompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true)
      return
    }

    if (!installPrompt) return

    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      setInstallPrompt(null)
    } catch (error) {
      console.error('Install error:', error)
    }
  }

  // Don't show if already installed
  if (isInstalled) return null

  // Don't show on desktop if no install prompt (browser doesn't support)
  if (!isIOS && !installPrompt) return null

  if (variant === 'sidebar') {
    return (
      <>
        <button
          onClick={handleInstall}
          className={`flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium transition-colors bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-200 hover:from-green-500/20 hover:to-emerald-500/20 ${className}`}
        >
          <Download className="h-5 w-5 flex-shrink-0 text-green-600" />
          <span className="flex-1 text-left">Install App</span>
          {isIOS ? (
            <Smartphone className="h-4 w-4 text-green-500" />
          ) : (
            <Monitor className="h-4 w-4 text-green-500" />
          )}
        </button>
        <IOSInstallModal open={showIOSModal} onClose={() => setShowIOSModal(false)} />
      </>
    )
  }

  if (variant === 'compact') {
    return (
      <>
        <Button
          onClick={handleInstall}
          size="sm"
          variant="outline"
          className={`gap-2 ${className}`}
        >
          <Download className="h-4 w-4" />
          Install
        </Button>
        <IOSInstallModal open={showIOSModal} onClose={() => setShowIOSModal(false)} />
      </>
    )
  }

  if (variant === 'banner') {
    return (
      <>
        <div className={`bg-gradient-to-r from-navy to-navy-800 text-white p-4 rounded-xl ${className}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="h-6 w-6 text-gold" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Get the App</h3>
              <p className="text-sm text-white/70">
                Install TPC Ministries for the best experience
              </p>
            </div>
            <Button
              onClick={handleInstall}
              className="bg-gold hover:bg-gold/90 text-navy"
            >
              Install
            </Button>
          </div>
        </div>
        <IOSInstallModal open={showIOSModal} onClose={() => setShowIOSModal(false)} />
      </>
    )
  }

  // Default variant
  return (
    <>
      <Button
        onClick={handleInstall}
        className={`gap-2 bg-green-600 hover:bg-green-700 ${className}`}
      >
        <Download className="h-4 w-4" />
        Install App
      </Button>
      <IOSInstallModal open={showIOSModal} onClose={() => setShowIOSModal(false)} />
    </>
  )
}

function IOSInstallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-navy" />
            Install on iPhone/iPad
          </DialogTitle>
          <DialogDescription>
            Follow these steps to add TPC Ministries to your home screen
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium">Tap the Share button</p>
              <p className="text-sm text-gray-500">
                Look for the <Share className="h-4 w-4 inline mx-1" /> icon at the bottom of Safari
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium">Scroll and tap "Add to Home Screen"</p>
              <p className="text-sm text-gray-500">
                It has a + icon next to it
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium">Tap "Add" in the top right</p>
              <p className="text-sm text-gray-500">
                The app will appear on your home screen
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gold/10 border border-gold/20 rounded-lg p-3">
          <p className="text-sm text-navy">
            <strong>Tip:</strong> Make sure you're using Safari. This won't work in Chrome or other browsers on iOS.
          </p>
        </div>
        <Button onClick={onClose} className="w-full bg-navy hover:bg-navy/90">
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  )
}
