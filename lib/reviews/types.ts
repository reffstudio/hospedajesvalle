import type { AmenityId } from "@/lib/property-amenities"
import type { PublicProperty } from "@/lib/properties/types"

export type ReviewTemplate = {
  id: string
  /** Empty = applies to any published property. */
  requiredAmenities: AmenityId[]
  es: string
  en: string
}

export type GuestProfile = {
  id: string
  name: string
  origin: { es: string; en: string }
}

export type DisplayReview = {
  id: string
  name: string
  origin: string
  property: string
  product: PublicProperty
  quote: string
  date: string
  rating: number
}
