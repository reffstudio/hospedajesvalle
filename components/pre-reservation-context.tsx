"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface PreReservationContextValue {
  isOpen: boolean
  initialPropertyId: string | null
  open: (propertyId?: string) => void
  close: () => void
}

const PreReservationContext = createContext<PreReservationContextValue | null>(null)

export function PreReservationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialPropertyId, setInitialPropertyId] = useState<string | null>(null)

  const open = useCallback((propertyId?: string) => {
    setInitialPropertyId(propertyId ?? null)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  return (
    <PreReservationContext.Provider value={{ isOpen, initialPropertyId, open, close }}>
      {children}
    </PreReservationContext.Provider>
  )
}

export function usePreReservation() {
  const ctx = useContext(PreReservationContext)
  if (!ctx) {
    throw new Error("usePreReservation must be used within a PreReservationProvider")
  }
  return ctx
}
