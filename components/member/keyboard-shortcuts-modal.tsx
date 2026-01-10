'use client'

import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Keyboard } from 'lucide-react'

export default function KeyboardShortcutsModal() {
  const { shortcuts, showShortcutsModal, setShowShortcutsModal, formatShortcut } = useKeyboardShortcuts()

  const navigationShortcuts = shortcuts.filter(s => s.category === 'navigation')
  const actionShortcuts = shortcuts.filter(s => s.category === 'actions')
  const generalShortcuts = shortcuts.filter(s => s.category === 'general')

  return (
    <Dialog open={showShortcutsModal} onOpenChange={setShowShortcutsModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Navigate faster with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Navigation
            </h4>
            <div className="space-y-2">
              {navigationShortcuts.map((shortcut) => (
                <div
                  key={shortcut.key + shortcut.description}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {shortcut.description}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {formatShortcut(shortcut)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Actions
            </h4>
            <div className="space-y-2">
              {actionShortcuts.map((shortcut) => (
                <div
                  key={shortcut.key + shortcut.description}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {shortcut.description}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {formatShortcut(shortcut)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* General */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              General
            </h4>
            <div className="space-y-2">
              {generalShortcuts.map((shortcut) => (
                <div
                  key={shortcut.key + shortcut.description}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {shortcut.description}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {formatShortcut(shortcut)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Press <Badge variant="outline" className="font-mono text-xs mx-1">?</Badge> anytime to show this menu
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
