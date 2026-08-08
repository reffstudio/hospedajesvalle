"use client"

import { createContext, useContext } from "react"
import type {
  DashboardPropertyInquiryLead,
  DashboardPropertyInquiryLeadUpdate,
} from "@/lib/dashboard/property-inquiry-types"

export type PropertyInquiryStoreContextValue = {
  inquiries: DashboardPropertyInquiryLead[]
  isReady: boolean
  isSyncing: boolean
  error: string | null
  updateInquiry: (id: string, patch: DashboardPropertyInquiryLeadUpdate) => Promise<void>
  refresh: () => Promise<void>
}

export const PropertyInquiryStoreContext = createContext<PropertyInquiryStoreContextValue | null>(null)

export function usePropertyInquiryStore() {
  const context = useContext(PropertyInquiryStoreContext)
  if (!context) {
    throw new Error("usePropertyInquiryStore must be used within PropertyInquiryStoreProvider")
  }
  return context
}
