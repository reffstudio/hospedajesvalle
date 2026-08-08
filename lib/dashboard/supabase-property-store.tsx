"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type {
  CustomAmenityDefinition,
  DashboardProperty,
  DashboardPropertyInput,
} from "@/lib/dashboard/types"
import type { CustomAmenityIconId } from "@/lib/custom-amenity-icons"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { mapPropertyRowsToDashboard } from "@/lib/supabase/map-rows"
import {
  addDashboardCustomAmenity,
  createDashboardProperty,
  deleteDashboardProperty,
  listDashboardProperties,
  reorderDashboardFeatured,
  seedDashboardProperties,
  updateDashboardProperty,
} from "@/lib/supabase/repository/dashboard-properties"

import { createSeedProperties } from "@/lib/dashboard/seed-properties"
import { PropertyStoreContext } from "@/lib/dashboard/property-store-context"

function mapSupabaseLoadError(message: string): string {
  if (message.includes("Could not find the table 'public.properties'")) {
    return "Faltan las tablas en Supabase. Abre el SQL Editor de tu proyecto, pega y ejecuta todo el archivo supabase/schema.sql del repo, luego recarga esta página."
  }
  return message
}

export function SupabasePropertyStoreProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<DashboardProperty[]>([])
  const [customAmenityCatalog, setCustomAmenityCatalog] = useState<CustomAmenityDefinition[]>([])
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
        setProperties([])
        setCustomAmenityCatalog([])
        setIsReady(true)
        return
      }

      const { bundles, catalog } = await listDashboardProperties(supabase)
      setProperties(
        bundles.map((bundle) => mapPropertyRowsToDashboard({ ...bundle, customAmenityCatalog: catalog })),
      )
      setCustomAmenityCatalog(catalog)
      setIsReady(true)
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Error al cargar propiedades desde Supabase."
      setError(mapSupabaseLoadError(message))
      setProperties([])
      setCustomAmenityCatalog([])
      setIsReady(true)
    }
  }, [])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    void refresh()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh()
    })

    return () => subscription.unsubscribe()
  }, [refresh])

  const runMutation = useCallback(async <T,>(operation: () => Promise<T>) => {
    setIsSyncing(true)
    setError(null)
    try {
      return await operation()
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : "Error al sincronizar con Supabase."
      setError(message)
      throw mutationError
    } finally {
      setIsSyncing(false)
    }
  }, [])

  const createProperty = useCallback(
    async (input: DashboardPropertyInput) => {
      return runMutation(async () => {
        const supabase = getSupabaseBrowserClient()
        const result = await createDashboardProperty(supabase, input, customAmenityCatalog, properties)
        setProperties((current) => [result.property, ...current])
        setCustomAmenityCatalog(result.catalog)
        return result.property
      })
    },
    [customAmenityCatalog, properties, runMutation],
  )

  const updateProperty = useCallback(
    async (id: string, input: Partial<DashboardPropertyInput>) => {
      await runMutation(async () => {
        const supabase = getSupabaseBrowserClient()
        const result = await updateDashboardProperty(supabase, id, input, customAmenityCatalog, properties)
        setProperties((current) => current.map((property) => (property.id === id ? result.property : property)))
        setCustomAmenityCatalog(result.catalog)
      })
    },
    [customAmenityCatalog, properties, runMutation],
  )

  const deleteProperty = useCallback(
    async (id: string) => {
      await runMutation(async () => {
        const supabase = getSupabaseBrowserClient()
        await deleteDashboardProperty(supabase, id)
        setProperties((current) => current.filter((property) => property.id !== id))
      })
    },
    [runMutation],
  )

  const reorderFeatured = useCallback(
    async (orderedIds: string[]) => {
      await runMutation(async () => {
        const supabase = getSupabaseBrowserClient()
        await reorderDashboardFeatured(supabase, orderedIds)
        await refresh()
      })
    },
    [refresh, runMutation],
  )

  const addCustomAmenityDefinition = useCallback(
    async (input: { label: string; iconId: CustomAmenityIconId }) => {
      return runMutation(async () => {
        const supabase = getSupabaseBrowserClient()
        const created = await addDashboardCustomAmenity(supabase, input, customAmenityCatalog)
        setCustomAmenityCatalog((current) => [...current, created])
        return created
      })
    },
    [customAmenityCatalog, runMutation],
  )

  const resetToSeed = useCallback(async () => {
    await runMutation(async () => {
      const supabase = getSupabaseBrowserClient()
      const seeds = createSeedProperties().map(({ id: _id, updatedAt: _updatedAt, ...rest }) => rest)
      const result = await seedDashboardProperties(supabase, seeds)
      setProperties(result.properties)
      setCustomAmenityCatalog(result.catalog)
    })
  }, [runMutation])

  const value = useMemo(
    () => ({
      properties,
      customAmenityCatalog,
      isReady,
      isSyncing,
      error,
      createProperty,
      updateProperty,
      deleteProperty,
      reorderFeatured,
      addCustomAmenityDefinition,
      resetToSeed,
      refresh,
    }),
    [
      properties,
      customAmenityCatalog,
      isReady,
      isSyncing,
      error,
      createProperty,
      updateProperty,
      deleteProperty,
      reorderFeatured,
      addCustomAmenityDefinition,
      resetToSeed,
      refresh,
    ],
  )

  return <PropertyStoreContext.Provider value={value}>{children}</PropertyStoreContext.Provider>
}
