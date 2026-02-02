"use client"

import * as React from "react"
import { CelebrationModal, CelebrationType } from "@/components/ui/celebration/celebration-modal"

interface CelebrationContextValue {
  celebrate: (type: CelebrationType, metadata?: Record<string, any>) => void
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
    metadata?: Record<string, any>
  }>({
    type: "milestone",
    open: false,
  })

  const celebrate = React.useCallback((type: CelebrationType, metadata?: Record<string, any>) => {
    setState({ type, open: true, metadata })
  }, [])

  const handleOpenChange = React.useCallback((open: boolean) => {
    setState(prev => ({ ...prev, open }))
  }, [])

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
      <CelebrationModal
        type={state.type}
        open={state.open}
        onOpenChange={handleOpenChange}
        metadata={state.metadata}
      />
    </CelebrationContext.Provider>
  )
}
