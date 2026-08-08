"use client"

import { createContext, useContext } from "react"
import type {
  DashboardPreReservationLead,
  DashboardPreReservationLeadUpdate,
} from "@/lib/dashboard/lead-types"

export type LeadStoreContextValue = {
  leads: DashboardPreReservationLead[]
  isReady: boolean
  isSyncing: boolean
  error: string | null
  updateLead: (id: string, patch: DashboardPreReservationLeadUpdate) => Promise<void>
  refresh: () => Promise<void>
}

export const LeadStoreContext = createContext<LeadStoreContextValue | null>(null)

export function useLeadStore() {
  const context = useContext(LeadStoreContext)
  if (!context) {
    throw new Error("useLeadStore must be used within LeadStoreProvider")
  }
  return context
}
