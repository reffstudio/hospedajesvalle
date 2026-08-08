import { env } from "@/lib/config/env"
import { createSeedProperties } from "@/lib/dashboard/seed-properties"
import type { CustomAmenityDefinition, DashboardProperty, PropertyStatus } from "@/lib/dashboard/types"
import { getStaticLegacyProducts } from "@/lib/properties/static-catalog"
import type { StaticLegacyProduct } from "@/lib/properties/static-catalog"
import type { Locale } from "@/lib/i18n/types"
import { mapDashboardPropertyToPublic } from "./map-to-public"
import type { PublicProperty, PublicPropertyQueryOptions } from "./types"

function sortFeaturedFirst(a: PublicProperty, b: PublicProperty) {
  if (a.featured !== b.featured) return a.featured ? -1 : 1
  if (a.featured && b.featured) {
    return (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER)
  }
  return a.name.localeCompare(b.name, "es")
}

function matchesStatus(property: PublicProperty, status?: PropertyStatus | PropertyStatus[]) {
  if (!status) return property.status === "published"
  const allowed = Array.isArray(status) ? status : [status]
  return allowed.includes(property.status)
}

/**
 * Static provider: merges locale copy from products.ts with dashboard seed metadata
 * (status, featured, slug). Until Supabase is connected, dashboard localStorage edits
 * do not affect the public site — only the default seed metadata applies server-side.
 */
function getStaticDashboardSeedBySlug(): Map<string, DashboardProperty> {
  return new Map(createSeedProperties().map((property) => [property.slug, property]))
}

function featuredProductToPublic(
  product: StaticLegacyProduct,
  seed: DashboardProperty,
  locale: Locale,
  customAmenityCatalog: CustomAmenityDefinition[],
): PublicProperty {
  const localized = mapDashboardPropertyToPublic(seed, customAmenityCatalog, locale, {
    id: seed.id,
    slug: seed.slug,
    status: seed.status,
    featured: seed.featured,
    featuredOrder: seed.featuredOrder,
    updatedAt: seed.updatedAt,
  })

  return {
    ...localized,
    name: product.name,
    price: product.price,
    dimensions: product.dimensions,
    includes: product.includes,
    amenities: product.amenities,
    quickLookImages: product.quickLookImages,
    image: product.image,
    materials: product.materials,
  }
}

function getStaticPublicProperties(
  locale: Locale,
  customAmenityCatalog: CustomAmenityDefinition[] = [],
): PublicProperty[] {
  const seedBySlug = getStaticDashboardSeedBySlug()
  const products = getStaticLegacyProducts(locale)

  return products
    .map((product) => {
      const seed = seedBySlug.get(product.id)
      if (!seed) return null
      return featuredProductToPublic(product, seed, locale, customAmenityCatalog)
    })
    .filter((item): item is PublicProperty => item !== null)
}

function filterPublicProperties(
  properties: PublicProperty[],
  { status, featuredOnly }: Pick<PublicPropertyQueryOptions, "status" | "featuredOnly">,
) {
  return properties.filter((property) => {
    if (!matchesStatus(property, status)) return false
    if (featuredOnly && !property.featured) return false
    return true
  })
}

/**
 * Synchronous read for client components and static provider.
 * When DATA_PROVIDER=supabase, use getPublicProperties() instead.
 */
export function getPublicPropertiesSync(options: PublicPropertyQueryOptions): PublicProperty[] {
  if (env.dataProvider === "supabase") {
    console.warn(
      "[getPublicPropertiesSync] NEXT_PUBLIC_DATA_PROVIDER=supabase — use getPublicProperties() for live data.",
    )
  }

  const properties = getStaticPublicProperties(options.locale)
  return filterPublicProperties(properties, options).sort(sortFeaturedFirst)
}

/** Featured carousel on the hero — published + featured, ordered. */
export function getFeaturedCarouselProperties(locale: Locale): PublicProperty[] {
  return getPublicPropertiesSync({ locale, featuredOnly: true })
}

/** Full directory — all published properties. */
export function getPublishedProperties(locale: Locale): PublicProperty[] {
  return getPublicPropertiesSync({ locale })
}

export function getPublicPropertyBySlug(locale: Locale, slug: string): PublicProperty | null {
  return getPublishedProperties(locale).find((property) => property.slug === slug) ?? null
}

export function getPublicPropertyById(locale: Locale, id: string): PublicProperty | null {
  return getPublishedProperties(locale).find((property) => property.id === id) ?? null
}

export function getPublishedPropertyCount(): number {
  return getPublicPropertiesSync({ locale: "es" }).length
}

/** Rounds down to the nearest multiple of 5 for marketing copy (e.g. 12 → 10). */
export function getRoundedPropertyDisplayCount(count = getPublishedPropertyCount()): number {
  return Math.floor(count / 5) * 5
}

export async function submitPreReservationLead(
  input: import("./types").PreReservationLeadInput,
): Promise<{ ok: true; id: string; emailSent?: boolean } | { ok: false; error: string }> {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const payload = (await response.json()) as
    | { ok: true; id: string; emailSent?: boolean }
    | { ok: false; error: string }

  return payload
}
