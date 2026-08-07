"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  migrateLegacyHighlights,
  normalizeHighlightAmenities,
} from "@/lib/dashboard/card-highlights"
import {
  createCustomAmenityDefinition,
  mergeCustomAmenityCatalog,
  normalizeCustomAmenityDefinition,
  normalizeCustomAmenityIds,
  normalizeHighlightCustomAmenities,
} from "@/lib/dashboard/custom-amenity-catalog"
import { parseBathrooms } from "@/lib/dashboard/property-content"
import { normalizePriceLabel, parseLegacyPrice } from "@/lib/dashboard/price"
import { createSeedProperties } from "@/lib/dashboard/seed-properties"
import { normalizePropertyIncludes } from "@/lib/dashboard/default-includes"
import { ensureUniquePropertySlug } from "@/lib/dashboard/property-slug"
import type {
  CustomAmenityDefinition,
  DashboardProperty,
  DashboardPropertyInput,
} from "@/lib/dashboard/types"
import type { CustomAmenityIconId } from "@/lib/custom-amenity-icons"
import type { AmenityId } from "@/lib/property-amenities"
import type { PropertyStayType } from "@/lib/property-stay-type"

import {
  DASHBOARD_CUSTOM_AMENITIES_KEY,
  DASHBOARD_PROPERTIES_KEY,
} from "@/lib/data/storage-keys"

const STORAGE_KEY = DASHBOARD_PROPERTIES_KEY
const CATALOG_STORAGE_KEY = DASHBOARD_CUSTOM_AMENITIES_KEY

/** Demo ids replaced by real client catalog — triggers one-time reseed on load. */
const LEGACY_DEMO_PROPERTY_IDS = ["villa-piedra", "cabana-madera", "domo-glamping"] as const

function shouldReseedFromCatalog(properties: DashboardProperty[]) {
  const ids = new Set(properties.map((property) => property.id))
  return LEGACY_DEMO_PROPERTY_IDS.some((legacyId) => ids.has(legacyId))
}

type LegacyCustomAmenity = {
  id?: string
  label?: string
  iconId?: string
  highlight?: boolean
}

type PropertyStoreContextValue = {
  properties: DashboardProperty[]
  customAmenityCatalog: CustomAmenityDefinition[]
  isReady: boolean
  createProperty: (input: DashboardPropertyInput) => DashboardProperty
  updateProperty: (id: string, input: Partial<DashboardPropertyInput>) => void
  deleteProperty: (id: string) => void
  reorderFeatured: (orderedIds: string[]) => void
  addCustomAmenityDefinition: (input: {
    label: string
    iconId: CustomAmenityIconId
  }) => CustomAmenityDefinition
  resetToSeed: () => void
}

const PropertyStoreContext = createContext<PropertyStoreContextValue | null>(null)

type LegacyLocaleContent = {
  name?: string
  priceLabel?: string
  dimensionsLabel?: string
  highlights?: string[]
}

type LegacyProperty = Partial<DashboardProperty> & {
  es?: LegacyLocaleContent
  en?: LegacyLocaleContent
  bathrooms?: number
  highlights?: string[]
  customAmenities?: LegacyCustomAmenity[]
}

function normalizeBathrooms(raw: LegacyProperty) {
  if (raw.fullBathrooms !== undefined || raw.halfBathrooms !== undefined) {
    return {
      fullBathrooms: raw.fullBathrooms ?? 0,
      halfBathrooms: raw.halfBathrooms ?? 0,
    }
  }

  return parseBathrooms(raw.bathrooms ?? 1)
}

function legacyCustomAmenitiesToState(raw: LegacyProperty) {
  const catalogEntries: CustomAmenityDefinition[] = []
  const customAmenityIds: string[] = []
  const highlightCustomAmenities: string[] = []

  for (const item of raw.customAmenities ?? []) {
    const definition = normalizeCustomAmenityDefinition({
      id: item.id,
      label: item.label,
      iconId: item.iconId as CustomAmenityIconId | undefined,
    })
    if (!definition) continue

    catalogEntries.push(definition)
    customAmenityIds.push(definition.id)
    if (item.highlight) highlightCustomAmenities.push(definition.id)
  }

  return { catalogEntries, customAmenityIds, highlightCustomAmenities }
}

function normalizeHighlightData(
  raw: LegacyProperty,
  amenities: AmenityId[],
  customAmenityCatalog: CustomAmenityDefinition[],
  customAmenityIds: string[],
  highlightCustomAmenities: string[],
) {
  if (raw.highlightAmenities !== undefined) {
    return {
      highlightAmenities: normalizeHighlightAmenities(raw.highlightAmenities, amenities),
      customAmenityCatalog,
      customAmenityIds,
      highlightCustomAmenities,
    }
  }

  const legacyHighlights = raw.highlights ?? raw.es?.highlights
  if (legacyHighlights?.length) {
    return migrateLegacyHighlights(
      legacyHighlights,
      amenities,
      customAmenityCatalog,
      customAmenityIds,
      highlightCustomAmenities,
    )
  }

  return {
    highlightAmenities: [] as AmenityId[],
    customAmenityCatalog,
    customAmenityIds,
    highlightCustomAmenities,
  }
}

function normalizeProperty(
  raw: LegacyProperty,
  catalog: CustomAmenityDefinition[],
): { property: DashboardProperty; catalog: CustomAmenityDefinition[] } {
  const legacyEs = raw.es
  const name = raw.name ?? legacyEs?.name ?? ""
  const legacyPrice = raw.priceLabel ?? legacyEs?.priceLabel ?? ""
  const parsedPrice = parseLegacyPrice(legacyPrice)
  const amenities = raw.amenities ?? []

  let customAmenityCatalog = [...catalog]
  let customAmenityIds = raw.customAmenityIds ?? []
  let highlightCustomAmenities = raw.highlightCustomAmenities ?? []

  if (raw.customAmenities?.length) {
    const legacy = legacyCustomAmenitiesToState(raw)
    customAmenityCatalog = mergeCustomAmenityCatalog(customAmenityCatalog, legacy.catalogEntries)
    customAmenityIds = [...new Set([...customAmenityIds, ...legacy.customAmenityIds])]
    highlightCustomAmenities = [...new Set([...highlightCustomAmenities, ...legacy.highlightCustomAmenities])]
  }

  customAmenityIds = normalizeCustomAmenityIds(customAmenityIds, customAmenityCatalog)
  highlightCustomAmenities = normalizeHighlightCustomAmenities(
    highlightCustomAmenities,
    customAmenityIds,
  )

  const highlightData = normalizeHighlightData(
    raw,
    amenities,
    customAmenityCatalog,
    customAmenityIds,
    highlightCustomAmenities,
  )

  return {
    catalog: highlightData.customAmenityCatalog,
    property: {
      id: raw.id ?? "",
      slug: raw.slug ?? "",
      name,
      priceLabel: raw.currency ? normalizePriceLabel(legacyPrice) : parsedPrice.priceLabel,
      currency: raw.currency ?? parsedPrice.currency,
      status: raw.status ?? "draft",
      stayType: raw.stayType ?? "private",
      featured: raw.featured ?? false,
      featuredOrder: raw.featuredOrder ?? null,
      amenities,
      highlightAmenities: highlightData.highlightAmenities,
      customAmenityIds: highlightData.customAmenityIds,
      highlightCustomAmenities: highlightData.highlightCustomAmenities,
      maxGuests: raw.maxGuests ?? 2,
      bedrooms: raw.bedrooms ?? 1,
      ...normalizeBathrooms(raw),
      includes: normalizePropertyIncludes(raw.includes),
      images: raw.images ?? [],
      updatedAt: raw.updatedAt ?? new Date().toISOString(),
    },
  }
}

function normalizeInput(
  input: DashboardPropertyInput,
  catalog: CustomAmenityDefinition[],
): DashboardPropertyInput {
  const customAmenityIds = normalizeCustomAmenityIds(input.customAmenityIds, catalog)

  return {
    ...input,
    priceLabel: normalizePriceLabel(input.priceLabel),
    highlightAmenities: normalizeHighlightAmenities(input.highlightAmenities, input.amenities),
    customAmenityIds,
    highlightCustomAmenities: normalizeHighlightCustomAmenities(
      input.highlightCustomAmenities,
      customAmenityIds,
    ),
    includes: normalizePropertyIncludes(input.includes),
  }
}

function loadCatalog(): CustomAmenityDefinition[] {
  if (typeof window === "undefined") return []

  const stored = window.localStorage.getItem(CATALOG_STORAGE_KEY)
  if (!stored) return []

  try {
    const parsed = JSON.parse(stored) as Partial<CustomAmenityDefinition>[]
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => normalizeCustomAmenityDefinition(item))
      .filter((item): item is CustomAmenityDefinition => item !== null)
  } catch {
    return []
  }
}

function loadProperties(): { properties: DashboardProperty[]; catalog: CustomAmenityDefinition[] } {
  if (typeof window === "undefined") {
    return { properties: createSeedProperties(), catalog: [] }
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return { properties: createSeedProperties(), catalog: loadCatalog() }
  }

  try {
    const parsed = JSON.parse(stored) as LegacyProperty[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { properties: createSeedProperties(), catalog: loadCatalog() }
    }

    let catalog = mergeCustomAmenityCatalog(loadCatalog(), [])
    const properties = parsed.map((property) => {
      const normalized = normalizeProperty(property, catalog)
      catalog = normalized.catalog
      return normalized.property
    })

    if (shouldReseedFromCatalog(properties)) {
      const seed = createSeedProperties()
      persist(seed)
      return { properties: seed, catalog: loadCatalog() }
    }

    return { properties, catalog }
  } catch {
    return { properties: createSeedProperties(), catalog: loadCatalog() }
  }
}

function persist(properties: DashboardProperty[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(properties))
}

function persistCatalog(catalog: CustomAmenityDefinition[]) {
  window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog))
}

export function PropertyStoreProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<DashboardProperty[]>([])
  const [customAmenityCatalog, setCustomAmenityCatalog] = useState<CustomAmenityDefinition[]>([])
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const loaded = loadProperties()
    setProperties(loaded.properties)
    setCustomAmenityCatalog(loaded.catalog)
    persistCatalog(loaded.catalog)
    setIsReady(true)
  }, [])

  const commit = useCallback((updater: (current: DashboardProperty[]) => DashboardProperty[]) => {
    setProperties((current) => {
      const next = updater(current)
      persist(next)
      return next
    })
  }, [])

  const commitCatalog = useCallback(
    (updater: (current: CustomAmenityDefinition[]) => CustomAmenityDefinition[]) => {
      setCustomAmenityCatalog((current) => {
        const next = updater(current)
        persistCatalog(next)
        return next
      })
    },
    [],
  )

  const addCustomAmenityDefinition = useCallback(
    (input: { label: string; iconId: CustomAmenityIconId }) => {
      let created!: CustomAmenityDefinition

      commitCatalog((current) => {
        created = createCustomAmenityDefinition(input.label, input.iconId, current)
        const existingIndex = current.findIndex((item) => item.id === created.id)

        if (existingIndex >= 0) {
          const next = [...current]
          next[existingIndex] = {
            ...next[existingIndex],
            iconId: created.iconId,
            label: created.label,
          }
          created = next[existingIndex]
          return next
        }

        return [...current, created]
      })

      return created
    },
    [commitCatalog],
  )

  const createProperty = useCallback(
    (input: DashboardPropertyInput) => {
      const normalized = normalizeInput(input, customAmenityCatalog)
      let created: DashboardProperty | null = null

      commit((current) => {
        const slug = ensureUniquePropertySlug(normalized.slug || normalized.name, current)
        created = {
          ...normalized,
          id: slug,
          slug,
          updatedAt: new Date().toISOString(),
        }
        return [created, ...current]
      })

      return created!
    },
    [commit, customAmenityCatalog],
  )

  const updateProperty = useCallback(
    (id: string, input: Partial<DashboardPropertyInput>) => {
      commit((current) =>
        current.map((property) => {
          if (property.id !== id) return property

          const amenities = input.amenities ?? property.amenities
          const customAmenityIds = input.customAmenityIds
            ? normalizeCustomAmenityIds(input.customAmenityIds, customAmenityCatalog)
            : property.customAmenityIds
          const highlightAmenities = input.highlightAmenities
            ? normalizeHighlightAmenities(input.highlightAmenities, amenities)
            : normalizeHighlightAmenities(property.highlightAmenities, amenities)
          const highlightCustomAmenities = input.highlightCustomAmenities
            ? normalizeHighlightCustomAmenities(input.highlightCustomAmenities, customAmenityIds)
            : normalizeHighlightCustomAmenities(property.highlightCustomAmenities, customAmenityIds)
          const slug =
            input.slug !== undefined
              ? ensureUniquePropertySlug(input.slug || property.name, current, id)
              : property.slug
          const nextId = input.slug !== undefined ? slug : property.id

          return {
            ...property,
            ...input,
            id: nextId,
            slug,
            amenities,
            highlightAmenities,
            customAmenityIds,
            highlightCustomAmenities,
            updatedAt: new Date().toISOString(),
          }
        }),
      )
    },
    [commit, customAmenityCatalog],
  )

  const deleteProperty = useCallback(
    (id: string) => {
      commit((current) => current.filter((property) => property.id !== id))
    },
    [commit],
  )

  const reorderFeatured = useCallback(
    (orderedIds: string[]) => {
      commit((current) =>
        current.map((property) => {
          const orderIndex = orderedIds.indexOf(property.id)
          if (orderIndex === -1) {
            return property.featured ? { ...property, featured: false, featuredOrder: null } : property
          }
          return { ...property, featured: true, featuredOrder: orderIndex + 1 }
        }),
      )
    },
    [commit],
  )

  const resetToSeed = useCallback(() => {
    const seed = createSeedProperties()
    persist(seed)
    persistCatalog([])
    setProperties(seed)
    setCustomAmenityCatalog([])
  }, [])

  const value = useMemo(
    () => ({
      properties,
      customAmenityCatalog,
      isReady,
      createProperty,
      updateProperty,
      deleteProperty,
      reorderFeatured,
      addCustomAmenityDefinition,
      resetToSeed,
    }),
    [
      properties,
      customAmenityCatalog,
      isReady,
      createProperty,
      updateProperty,
      deleteProperty,
      reorderFeatured,
      addCustomAmenityDefinition,
      resetToSeed,
    ],
  )

  return <PropertyStoreContext.Provider value={value}>{children}</PropertyStoreContext.Provider>
}

export function usePropertyStore() {
  const context = useContext(PropertyStoreContext)
  if (!context) {
    throw new Error("usePropertyStore must be used within PropertyStoreProvider")
  }
  return context
}
