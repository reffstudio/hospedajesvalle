"use client"

import { useMemo, type ReactNode } from "react"
import { env, isSupabaseConfigured } from "@/lib/config/env"
import { LeadStoreContext } from "@/lib/dashboard/lead-store-context"
import { SupabaseLeadStoreProvider } from "@/lib/dashboard/supabase-lead-store"

function EmptyLeadStoreProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      leads: [],
      isReady: true,
      isSyncing: false,
      error:
        env.dataProvider === "supabase" && !isSupabaseConfigured()
          ? "Configura las variables de Supabase para ver pre-reservas."
          : null,
      updateLead: async () => {},
      refresh: async () => {},
    }),
    [],
  )

  return <LeadStoreContext.Provider value={value}>{children}</LeadStoreContext.Provider>
}

export function LeadStoreProvider({ children }: { children: ReactNode }) {
  if (env.dataProvider === "supabase" && isSupabaseConfigured()) {
    return <SupabaseLeadStoreProvider>{children}</SupabaseLeadStoreProvider>
  }

  return <EmptyLeadStoreProvider>{children}</EmptyLeadStoreProvider>
}

export { useLeadStore } from "@/lib/dashboard/lead-store-context"
