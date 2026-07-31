import type { AmenityId } from "@/lib/property-amenities"
import type { CustomAmenityIconId } from "@/lib/custom-amenity-icons"

export type PropertyStatus = "published" | "hidden" | "draft"

export type PropertyBadge = "Nuevo" | "Popular" | "Limitado" | null

export type PropertyCurrency = "MXN" | "USD"

export type PropertyImage = {
  id: string
  /** Public URL (Storage CDN in production). */
  url: string
  /** Supabase Storage object path — set after upload, used for deletes. */
  storagePath?: string
  sortOrder: number
  isCover: boolean
}

export type CustomAmenityDefinition = {
  id: string
  label: string
  iconId: CustomAmenityIconId
}

export type DashboardProperty = {
  /** Stable UUID in Supabase. In localStorage dev, equals slug until migration. */
  id: string
  /** URL segment — unique, editable independently of id in production. */
  slug: string
  name: string
  priceLabel: string
  currency: PropertyCurrency
  status: PropertyStatus
  featured: boolean
  featuredOrder: number | null
  badge: PropertyBadge
  amenities: AmenityId[]
  highlightAmenities: AmenityId[]
  customAmenityIds: string[]
  highlightCustomAmenities: string[]
  maxGuests: number
  bedrooms: number
  fullBathrooms: number
  halfBathrooms: number
  includes: string[]
  images: PropertyImage[]
  updatedAt: string
}

export type DashboardPropertyInput = Omit<DashboardProperty, "id" | "updatedAt">
