/**
 * @deprecated Import from `@/lib/properties/types` and `@/lib/properties/queries` instead.
 */
import type { Locale } from "./types"
import type { PublicProperty } from "@/lib/properties/types"
import {
  getFeaturedCarouselProperties,
  getPublishedProperties,
  getPublishedPropertyCount,
  getRoundedPropertyDisplayCount,
} from "@/lib/properties/queries"

export type FeaturedProduct = PublicProperty

/** @deprecated Use getPublishedProperties() */
export function getFeaturedProducts(locale: Locale): FeaturedProduct[] {
  return getPublishedProperties(locale)
}

export { getFeaturedCarouselProperties, getPublishedProperties, getPublishedPropertyCount, getRoundedPropertyDisplayCount }

export function getPropertyCount(): number {
  return getPublishedPropertyCount()
}
