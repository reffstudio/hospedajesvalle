import { env } from "@/lib/config/env"
import { getFeaturedCarouselProperties, getPublishedProperties } from "@/lib/properties/queries"
import { hydratePublicProperties } from "@/lib/properties/hydrate-public-property"
import type { PublicProperty } from "@/lib/properties/types"
import type { Locale } from "@/lib/i18n/types"

type CacheEntry = {
  all: PublicProperty[]
  featured: PublicProperty[]
}

const cache = new Map<Locale, CacheEntry>()
const inflight = new Map<Locale, Promise<CacheEntry>>()

function getStaticEntry(locale: Locale): CacheEntry {
  return {
    all: getPublishedProperties(locale),
    featured: getFeaturedCarouselProperties(locale),
  }
}

async function fetchEntry(locale: Locale): Promise<CacheEntry> {
  if (env.dataProvider !== "supabase") {
    const entry = getStaticEntry(locale)
    cache.set(locale, entry)
    return entry
  }

  const cached = cache.get(locale)
  if (cached) return cached

  const pending = inflight.get(locale)
  if (pending) return pending

  const request = (async () => {
    const params = (featured: boolean) =>
      new URLSearchParams({ locale, featured: String(featured) }).toString()

    const [allResponse, featuredResponse] = await Promise.all([
      fetch(`/api/properties?${params(false)}`),
      fetch(`/api/properties?${params(true)}`),
    ])

    if (!allResponse.ok || !featuredResponse.ok) {
      throw new Error("No se pudieron cargar las propiedades.")
    }

    const [allPayload, featuredPayload] = await Promise.all([
      allResponse.json() as Promise<{ properties: PublicProperty[] }>,
      featuredResponse.json() as Promise<{ properties: PublicProperty[] }>,
    ])

    const entry: CacheEntry = {
      all: hydratePublicProperties(allPayload.properties, locale),
      featured: hydratePublicProperties(featuredPayload.properties, locale),
    }

    cache.set(locale, entry)
    return entry
  })()
    .finally(() => {
      inflight.delete(locale)
    })

  inflight.set(locale, request)
  return request
}

export function readPublicPropertiesCache(locale: Locale): CacheEntry | null {
  if (env.dataProvider !== "supabase") {
    return getStaticEntry(locale)
  }
  return cache.get(locale) ?? null
}

export async function ensurePublicProperties(locale: Locale): Promise<CacheEntry> {
  const cached = readPublicPropertiesCache(locale)
  if (cached) return cached
  return fetchEntry(locale)
}

export function prefetchPublicProperties(locale: Locale) {
  void ensurePublicProperties(locale).catch((error) => {
    console.error("[prefetchPublicProperties]", error)
  })
}
