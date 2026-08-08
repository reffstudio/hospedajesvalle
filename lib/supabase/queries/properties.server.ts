import "server-only"

import type { Locale } from "@/lib/i18n/types"
import { mapDashboardPropertyToPublic } from "@/lib/properties/map-to-public"
import type { PublicProperty, PublicPropertyQueryOptions } from "@/lib/properties/types"
import { mapPropertyRowsToDashboard } from "@/lib/supabase/map-rows"
import { fetchPropertyBundles } from "@/lib/supabase/queries/property-bundles"
import { getSupabaseServerClient } from "@/lib/supabase/server"

function sortFeaturedFirst(a: PublicProperty, b: PublicProperty) {
  if (a.featured !== b.featured) return a.featured ? -1 : 1
  if (a.featured && b.featured) {
    return (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER)
  }
  return a.name.localeCompare(b.name, "es")
}

function bundleToPublic(
  bundle: Awaited<ReturnType<typeof fetchPropertyBundles>>["bundles"][number],
  locale: Locale,
) {
  const dashboard = mapPropertyRowsToDashboard(bundle)
  return mapDashboardPropertyToPublic(dashboard, bundle.customAmenityCatalog, locale, {
    id: dashboard.id,
    slug: dashboard.slug,
    status: dashboard.status,
    featured: dashboard.featured,
    featuredOrder: dashboard.featuredOrder,
    updatedAt: dashboard.updatedAt,
  })
}

export async function fetchPublicPropertiesFromSupabase(
  options: PublicPropertyQueryOptions,
): Promise<PublicProperty[]> {
  const supabase = await getSupabaseServerClient()
  const { bundles } = await fetchPropertyBundles(supabase, { publishedOnly: true })

  let properties = bundles.map((bundle) => bundleToPublic(bundle, options.locale))

  if (options.featuredOnly) {
    properties = properties.filter((property) => property.featured)
  }

  if (options.status) {
    const allowed = Array.isArray(options.status) ? options.status : [options.status]
    properties = properties.filter((property) => allowed.includes(property.status))
  }

  return properties.sort(sortFeaturedFirst)
}

export async function fetchPublicPropertyBySlugFromSupabase(
  locale: PublicPropertyQueryOptions["locale"],
  slug: string,
): Promise<PublicProperty | null> {
  const properties = await fetchPublicPropertiesFromSupabase({ locale })
  return properties.find((property) => property.slug === slug) ?? null
}
