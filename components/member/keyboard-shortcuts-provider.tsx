'use client'

import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import KeyboardShortcutsModal from './keyboard-shortcuts-modal'

/**
 * Provider component that enables keyboard shortcuts in the member portal.
 * Wrap this around any content where you want shortcuts to work.
 */
export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  // Initialize the keyboard shortcuts hook (registers event listeners)
  useKeyboardShortcuts()

  return (
    <>
      {children}
      <KeyboardShortcutsModal />
    </>
  )
}
