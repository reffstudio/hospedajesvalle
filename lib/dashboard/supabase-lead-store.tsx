"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type {
  DashboardPreReservationLead,
  DashboardPreReservationLeadUpdate,
} from "@/lib/dashboard/lead-types"
import { LeadStoreContext } from "@/lib/dashboard/lead-store-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  listDashboardLeads,
  mapLeadRowToDashboard,
  updateDashboardLead,
} from "@/lib/supabase/repository/dashboard-leads"
import {
  subscribePreReservationLeadChanges,
} from "@/lib/supabase/realtime/dashboard-leads"

function mapSupabaseLoadError(message: string): string {
  if (message.includes("Could not find the table 'public.pre_reservation_leads'")) {
    return "Faltan las tablas de pre-reservas en Supabase. Ejecuta supabase/schema.sql y recarga esta página."
  }
  if (message.includes("column pre_reservation_leads.status does not exist")) {
    return "Falta la migración de seguimiento. Ejecuta supabase/migrations/20250807_lead_status.sql en el SQL Editor de Supabase."
  }
  return message
}

export function SupabaseLeadStoreProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<DashboardPreReservationLead[]>([])
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
        setLeads([])
        setIsReady(true)
        return
      }

      const rows = await listDashboardLeads(supabase)
      setLeads(rows)
      setIsReady(true)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Error al cargar pre-reservas."
      setError(mapSupabaseLoadError(message))
      setLeads([])
      setIsReady(true)
    }
  }, [])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    let leadsChannel: ReturnType<typeof subscribePreReservationLeadChanges> | null = null

    const sync = async () => {
      if (leadsChannel) {
        await supabase.removeChannel(leadsChannel)
        leadsChannel = null
      }

      await refresh()

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      leadsChannel = subscribePreReservationLeadChanges(supabase, {
        onInsert: (lead) => {
          setLeads((current) => {
            if (current.some((item) => item.id === lead.id)) return current
            return [lead, ...current]
          })
        },
        onUpdate: (lead) => {
          setLeads((current) => current.map((item) => (item.id === lead.id ? lead : item)))
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
      if (leadsChannel) {
        void supabase.removeChannel(leadsChannel)
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

  const updateLead = useCallback(
    async (id: string, patch: DashboardPreReservationLeadUpdate) => {
      await runMutation(async () => {
        const supabase = getSupabaseBrowserClient()
        await updateDashboardLead(supabase, id, patch)

        setLeads((current) =>
          current.map((lead) => {
            if (lead.id !== id) return lead
            return {
              ...lead,
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
      leads,
      isReady,
      isSyncing,
      error,
      updateLead,
      refresh,
    }),
    [leads, isReady, isSyncing, error, updateLead, refresh],
  )

  return <LeadStoreContext.Provider value={value}>{children}</LeadStoreContext.Provider>
}

export { mapLeadRowToDashboard }
