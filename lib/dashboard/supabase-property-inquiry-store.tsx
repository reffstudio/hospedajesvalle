"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type {
  DashboardPropertyInquiryLead,
  DashboardPropertyInquiryLeadUpdate,
} from "@/lib/dashboard/property-inquiry-types"
import { PropertyInquiryStoreContext } from "@/lib/dashboard/property-inquiry-store-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  listDashboardPropertyInquiries,
  updateDashboardPropertyInquiry,
} from "@/lib/supabase/repository/dashboard-property-inquiries"
import { subscribePropertyInquiryLeadChanges } from "@/lib/supabase/realtime/dashboard-leads"

function mapSupabaseLoadError(message: string): string {
  if (message.includes("Could not find the table 'public.property_inquiry_leads'")) {
    return "Faltan las tablas de propiedades en Supabase. Ejecuta supabase/migrations/20250807_property_inquiry_leads.sql y recarga."
  }
  return message
}

export function SupabasePropertyInquiryStoreProvider({ children }: { children: ReactNode }) {
  const [inquiries, setInquiries] = useState<DashboardPropertyInquiryLead[]>([])
  const [isReady, setIsReady] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setInquiries([])
        setIsReady(true)
        return
      }

      const rows = await listDashboardPropertyInquiries(supabase)
      setInquiries(rows)
      setIsReady(true)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Error al cargar solicitudes."
      setError(mapSupabaseLoadError(message))
      setInquiries([])
      setIsReady(true)
    }
  }, [])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    let inquiriesChannel: ReturnType<typeof subscribePropertyInquiryLeadChanges> | null = null

    const sync = async () => {
      if (inquiriesChannel) {
        await supabase.removeChannel(inquiriesChannel)
        inquiriesChannel = null
      }

      await refresh()

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      inquiriesChannel = subscribePropertyInquiryLeadChanges(supabase, {
        onInsert: (inquiry) => {
          setInquiries((current) => {
            if (current.some((item) => item.id === inquiry.id)) return current
            return [inquiry, ...current]
          })
        },
        onUpdate: (inquiry) => {
          setInquiries((current) => current.map((item) => (item.id === inquiry.id ? inquiry : item)))
        },
      })
    }

    void sync()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void sync()
    })

    return () => {
      subscription.unsubscribe()
      if (inquiriesChannel) {
        void supabase.removeChannel(inquiriesChannel)
      }
    }
  }, [refresh])

  const runMutation = useCallback(async (mutation: () => Promise<void>) => {
    setIsSyncing(true)
    setError(null)
    try {
      await mutation()
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : "No se pudo guardar el cambio."
      setError(message)
      throw mutationError
    } finally {
      setIsSyncing(false)
    }
  }, [])

  const updateInquiry = useCallback(
    async (id: string, patch: DashboardPropertyInquiryLeadUpdate) => {
      await runMutation(async () => {
        const supabase = getSupabaseBrowserClient()
        await updateDashboardPropertyInquiry(supabase, id, patch)

        setInquiries((current) =>
          current.map((inquiry) => {
            if (inquiry.id !== id) return inquiry
            return {
              ...inquiry,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          }),
        )
      })
    },
    [runMutation],
  )

  const value = useMemo(
    () => ({
      inquiries,
      isReady,
      isSyncing,
      error,
      updateInquiry,
      refresh,
    }),
    [inquiries, isReady, isSyncing, error, updateInquiry, refresh],
  )

  return <PropertyInquiryStoreContext.Provider value={value}>{children}</PropertyInquiryStoreContext.Provider>
}
