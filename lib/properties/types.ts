import type { AmenityListItem } from "@/lib/amenity-list"
import type { PropertyBadge, PropertyStatus } from "@/lib/dashboard/types"
import type { AmenityId } from "@/lib/property-amenities"
import type { Locale } from "@/lib/i18n/types"

/**
 * Canonical shape consumed by the public site (hero, directory, modals).
 * Built from DashboardProperty via mapDashboardPropertyToPublic().
 */
export type PublicProperty = {
  /** Stable UUID in production (Supabase). Slug may differ after edits. */
  id: string
  slug: string
  name: string
  price: string
  image: string
  badge?: NonNullable<PropertyBadge>
  /** Card highlight chips (bedrooms, baths, starred amenities). */
  materials: string[]
  amenityItems: AmenityListItem[]
  quickLookImages: string[]
  dimensions: string
  amenities: AmenityId[]
  includes: string[]
  status: PropertyStatus
  featured: boolean
  featuredOrder: number | null
}

export type PublicPropertyQueryOptions = {
  locale: Locale
  /** Defaults to published only on the public site. */
  status?: PropertyStatus | PropertyStatus[]
  featuredOnly?: boolean
}

export type PreReservationLeadInput = {
  name: string
  email: string
  phone: string
  guests: number
  propertyIds: string[]
  checkIn: string
  checkOut: string
  locale: Locale
}

export type PreReservationLead = PreReservationLeadInput & {
  id: string
  createdAt: string
}
