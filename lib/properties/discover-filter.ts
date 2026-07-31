import type { DiscoverValleyFilterCategory } from "@/lib/discover-valley"
import type { AmenityId } from "@/lib/property-amenities"

/**
 * Maps Discover Valle gallery categories to property amenity filters.
 * Used when scrolling from the experience strip to the properties directory.
 */
export const DISCOVER_FILTER_TO_AMENITIES: Record<DiscoverValleyFilterCategory, AmenityId[]> = {
  vinas: ["wine-cellar", "vineyard-view"],
  gastronomia: ["breakfast"],
  firepit: ["fire-pit"],
  pool: ["pool", "jacuzzi", "spa"],
  views: ["vineyard-view", "terrace"],
}

export function amenitiesForDiscoverFilter(category: DiscoverValleyFilterCategory): AmenityId[] {
  return DISCOVER_FILTER_TO_AMENITIES[category]
}

export function isDiscoverFilterCategory(value: string): value is DiscoverValleyFilterCategory {
  return value in DISCOVER_FILTER_TO_AMENITIES
}
