"use client"

import { createContext, useContext } from "react"
import type {
  CustomAmenityDefinition,
  DashboardProperty,
  DashboardPropertyInput,
} from "@/lib/dashboard/types"
import type { CustomAmenityIconId } from "@/lib/custom-amenity-icons"

export type PropertyStoreContextValue = {
  properties: DashboardProperty[]
  customAmenityCatalog: CustomAmenityDefinition[]
  isReady: boolean
  isSyncing: boolean
  error: string | null
  createProperty: (input: DashboardPropertyInput) => Promise<DashboardProperty>
  updateProperty: (id: string, input: Partial<DashboardPropertyInput>) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
  reorderFeatured: (orderedIds: string[]) => Promise<void>
  addCustomAmenityDefinition: (input: {
    label: string
    iconId: CustomAmenityIconId
  }) => Promise<CustomAmenityDefinition>
  resetToSeed: () => Promise<void>
  refresh: () => Promise<void>
}

export const PropertyStoreContext = createContext<PropertyStoreContextValue | null>(null)

export function usePropertyStore() {
  const context = useContext(PropertyStoreContext)
  if (!context) {
    throw new Error("usePropertyStore must be used within PropertyStoreProvider")
  }
  return context
}
