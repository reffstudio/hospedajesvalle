import { getStaticLegacyProducts, getStaticPropertyStayType } from "@/lib/properties/static-catalog"
import { inferHighlightAmenities } from "@/lib/dashboard/card-highlights"
import { createDefaultPropertyIncludes } from "@/lib/dashboard/default-includes"
import { parseBathrooms } from "@/lib/dashboard/property-content"
import { parseLegacyPrice } from "@/lib/dashboard/price"
import type { DashboardProperty } from "./types"

function parseCapacity(dimensions: string) {
  const guests = dimensions.match(/(\d+)/)?.[1]
  const baths = dimensions.match(/(\d+(?:\.\d+)?)\s*ba/i)?.[1]
  const beds = dimensions.match(/(\d+)\s*rec|(\d+)\s*bed/i)?.[1] ?? dimensions.match(/^(\d+)/)?.[1]
  const bathroomCount = baths ? Number(baths) : 1

  return {
    maxGuests: guests ? Number(guests) : 2,
    bedrooms: beds ? Number(beds) : 1,
    ...parseBathrooms(bathroomCount),
  }
}

export function createSeedProperties(): DashboardProperty[] {
  const products = getStaticLegacyProducts("es")

  return products.map((product, index) => {
    const capacity = parseCapacity(product.dimensions)
    const { priceLabel, currency } = parseLegacyPrice(product.price)

    return {
      id: product.id,
      slug: product.id,
      name: product.name,
      priceLabel,
      currency,
      status: "published" as const,
      stayType: getStaticPropertyStayType(product.id),
      featured: index < 6,
      featuredOrder: index < 6 ? index + 1 : null,
      amenities: product.amenities,
      highlightAmenities: inferHighlightAmenities(product.materials, product.amenities),
      customAmenityIds: [],
      highlightCustomAmenities: [],
      includes: createDefaultPropertyIncludes(),
      ...capacity,
      images: product.quickLookImages.map((url, imageIndex) => ({
        id: `${product.id}-img-${imageIndex}`,
        url,
        sortOrder: imageIndex,
        isCover: imageIndex === 0,
      })),
      updatedAt: new Date().toISOString(),
    }
  })
}
