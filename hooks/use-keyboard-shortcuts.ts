'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean // Cmd on Mac
  action: () => void
  description: string
  category: 'navigation' | 'actions' | 'general'
}

const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

/**
 * Hook for keyboard shortcuts in the member portal
 */
export function useKeyboardShortcuts() {
  const router = useRouter()
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  // Define all shortcuts
  const shortcuts: ShortcutConfig[] = [
    // Navigation shortcuts
    {
      key: 'h',
      meta: isMac,
      ctrl: !isMac,
      action: () => router.push('/dashboard'),
      description: 'Go to Dashboard',
      category: 'navigation'
    },
    {
      key: 'd',
      meta: isMac,
      ctrl: !isMac,
      action: () => router.push('/daily-routine'),
      description: 'Go to Daily Routine',
      category: 'navigation'
    },
    {
      key: 'p',
      meta: isMac,
      ctrl: !isMac,
      action: () => router.push('/prayer'),
      description: 'Go to Prayer',
      category: 'navigation'
    },
    {
      key: 'j',
      meta: isMac,
      ctrl: !isMac,
      action: () => router.push('/journal'),
      description: 'Go to Journal',
      category: 'navigation'
    },
    {
      key: 'l',
      meta: isMac,
      ctrl: !isMac,
      action: () => router.push('/library'),
      description: 'Go to Library',
      category: 'navigation'
    },
    {
      key: 'g',
      meta: isMac,
      ctrl: !isMac,
      action: () => router.push('/groups'),
      description: 'Go to Groups',
      category: 'navigation'
    },
    {
      key: 'm',
      meta: isMac,
      ctrl: !isMac,
      action: () => router.push('/messages'),
      description: 'Go to Messages',
      category: 'navigation'
    },
    {
      key: 'e',
      meta: isMac,
      ctrl: !isMac,
      action: () => router.push('/events'),
      description: 'Go to Events',
      category: 'navigation'
    },
    // Action shortcuts
    {
      key: 'a',
      meta: isMac,
      ctrl: !isMac,
      action: () => router.push('/ask-prophet-lorenzo'),
      description: 'Ask Prophet Lorenzo (AI)',
      category: 'actions'
    },
    {
      key: 'n',
      meta: isMac,
      ctrl: !isMac,
      shift: true,
      action: () => router.push('/journal?new=true'),
      description: 'New Journal Entry',
      category: 'actions'
    },
    {
      key: 'k',
      meta: isMac,
      ctrl: !isMac,
      action: () => {
        // Focus search input if available
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: 'Focus Search',
      category: 'actions'
    },
    // General shortcuts
    {
      key: '?',
      shift: true,
      action: () => setShowShortcutsModal(true),
      description: 'Show Keyboard Shortcuts',
      category: 'general'
    },
    {
      key: 'Escape',
      action: () => setShowShortcutsModal(false),
      description: 'Close Modal',
      category: 'general'
    }
  ]

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Exception: allow Escape in inputs to blur
      if (event.key === 'Escape') {
        target.blur()
      }
      return
    }

    // Find matching shortcut
    const matchedShortcut = shortcuts.find(shortcut => {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey
      const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
      const altMatches = shortcut.alt ? event.altKey : !event.altKey

      // For modifier-based shortcuts, require the modifier
      if (shortcut.ctrl || shortcut.meta) {
        return keyMatches && (event.ctrlKey || event.metaKey) &&
               shiftMatches && altMatches
      }

      // For shift-only shortcuts (like ?)
      if (shortcut.shift && !shortcut.ctrl && !shortcut.meta) {
        return keyMatches && event.shiftKey && !event.ctrlKey && !event.metaKey
      }

      // For simple shortcuts without modifiers
      if (!shortcut.ctrl && !shortcut.meta && !shortcut.shift && !shortcut.alt) {
        return keyMatches && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
      }

      return false
    })

    if (matchedShortcut) {
      event.preventDefault()
      matchedShortcut.action()
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Helper to format shortcut keys for display
  const formatShortcut = (shortcut: ShortcutConfig): string => {
    const parts: string[] = []
    if (shortcut.ctrl || shortcut.meta) {
      parts.push(isMac ? '⌘' : 'Ctrl')
    }
    if (shortcut.shift) {
      parts.push(isMac ? '⇧' : 'Shift')
    }
    if (shortcut.alt) {
      parts.push(isMac ? '⌥' : 'Alt')
    }
    parts.push(shortcut.key.toUpperCase())
    return parts.join(isMac ? '' : '+')
  }

  return {
    shortcuts,
    showShortcutsModal,
    setShowShortcutsModal,
    formatShortcut
  }
}

/**
 * Get shortcut display for a specific action
 */
export function getShortcutHint(action: string): string {
  const isMacClient = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const prefix = isMacClient ? '⌘' : 'Ctrl+'

  const hints: Record<string, string> = {
    'dashboard': `${prefix}H`,
    'daily-routine': `${prefix}D`,
    'prayer': `${prefix}P`,
    'journal': `${prefix}J`,
    'library': `${prefix}L`,
    'groups': `${prefix}G`,
    'messages': `${prefix}M`,
    'events': `${prefix}E`,
    'ask-ai': `${prefix}A`,
    'search': `${prefix}K`,
    'help': '?'
  }

  return hints[action] || ''
}
