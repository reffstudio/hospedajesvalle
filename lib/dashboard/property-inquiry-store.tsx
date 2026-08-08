"use client"

import { useMemo, type ReactNode } from "react"
import { env, isSupabaseConfigured } from "@/lib/config/env"
import { PropertyInquiryStoreContext } from "@/lib/dashboard/property-inquiry-store-context"
import { SupabasePropertyInquiryStoreProvider } from "@/lib/dashboard/supabase-property-inquiry-store"

function EmptyPropertyInquiryStoreProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      inquiries: [],
      isReady: true,
      isSyncing: false,
      error:
        env.dataProvider === "supabase" && !isSupabaseConfigured()
          ? "Configura las variables de Supabase para ver solicitudes."
          : null,
      updateInquiry: async () => {},
      refresh: async () => {},
    }),
    [],
  )

  return <PropertyInquiryStoreContext.Provider value={value}>{children}</PropertyInquiryStoreContext.Provider>
}

export function PropertyInquiryStoreProvider({ children }: { children: ReactNode }) {
  if (env.dataProvider === "supabase" && isSupabaseConfigured()) {
    return <SupabasePropertyInquiryStoreProvider>{children}</SupabasePropertyInquiryStoreProvider>
  }

  return <EmptyPropertyInquiryStoreProvider>{children}</EmptyPropertyInquiryStoreProvider>
}

export { usePropertyInquiryStore } from "@/lib/dashboard/property-inquiry-store-context"
