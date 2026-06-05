"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import type { CelebrationType } from "@/components/ui/celebration/celebration-modal"

// Modal pulls framer-motion + dialog tree + canvas-confetti. Defer it until
// a celebration actually fires — the celebrate() trigger flips state.open,
// React then mounts the dynamic chunk on next render. Brief load before the
// modal appears is fine since the user just triggered the action.
const CelebrationModal = dynamic(
  () =>
    import("@/components/ui/celebration/celebration-modal").then((m) => ({
      default: m.CelebrationModal,
    })),
  { ssr: false, loading: () => null },
)

interface CelebrationContextValue {
  celebrate: (type: CelebrationType, metadata?: Record<string, unknown>) => void
}

const CelebrationContext = React.createContext<CelebrationContextValue | null>(null)

export function useCelebrationContext() {
  const context = React.useContext(CelebrationContext)
  if (!context) {
    throw new Error("useCelebrationContext must be used within a CelebrationProvider")
  }
  return context
}

interface CelebrationProviderProps {
  children: React.ReactNode
}

export function CelebrationProvider({ children }: CelebrationProviderProps) {
  const [state, setState] = React.useState<{
    type: CelebrationType
    open: boolean
    metadata?: Record<string, unknown>
    everOpened: boolean
  }>({
    type: "milestone",
    open: false,
    everOpened: false,
  })

  const celebrate = React.useCallback((type: CelebrationType, metadata?: Record<string, unknown>) => {
    setState({ type, open: true, metadata, everOpened: true })
  }, [])

  const handleOpenChange = React.useCallback((open: boolean) => {
    setState(prev => ({ ...prev, open }))
  }, [])

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
      {state.everOpened && (
        <CelebrationModal
          type={state.type}
          open={state.open}
          onOpenChange={handleOpenChange}
          metadata={state.metadata}
        />
      )}
    </CelebrationContext.Provider>
  )
}
