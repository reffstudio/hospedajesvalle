import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"
import type { CustomAmenityDefinition } from "@/lib/dashboard/types"
import type { AmenityId } from "@/lib/property-amenities"
import { AMENITY_IDS } from "@/lib/property-amenities"
import { isCustomAmenityIconId } from "@/lib/custom-amenity-icons"
import { mapPropertyRowsToDashboard, type PropertyRowBundle } from "@/lib/supabase/map-rows"

type Client = SupabaseClient<Database>

type FetchBundlesOptions = {
  publishedOnly?: boolean
}

const AMENITY_ID_SET = new Set<string>(AMENITY_IDS)

function mapCustomAmenityRows(
  rows: { id: string; label: string; icon_id: string }[],
): CustomAmenityDefinition[] {
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    iconId: isCustomAmenityIconId(row.icon_id) ? row.icon_id : "goal",
  }))
}

export async function fetchPropertyBundles(
  supabase: Client,
  options: FetchBundlesOptions = {},
): Promise<{ bundles: PropertyRowBundle[]; catalog: CustomAmenityDefinition[] }> {
  let propertiesQuery = supabase.from("properties").select("*").order("updated_at", { ascending: false })

  if (options.publishedOnly) {
    propertiesQuery = propertiesQuery.eq("status", "published")
  }

  const [
    { data: properties, error: propertiesError },
    { data: images, error: imagesError },
    { data: amenities, error: amenitiesError },
    { data: highlightAmenities, error: highlightError },
    { data: customAmenityLinks, error: customLinksError },
    { data: customAmenityRows, error: customAmenitiesError },
  ] = await Promise.all([
    propertiesQuery,
    supabase.from("property_images").select("*"),
    supabase.from("property_amenities").select("property_id, amenity_id"),
    supabase.from("property_highlight_amenities").select("property_id, amenity_id"),
    supabase.from("property_custom_amenities").select("property_id, custom_amenity_id, is_highlight"),
    supabase.from("custom_amenities").select("*"),
  ])

  const error =
    propertiesError ??
    imagesError ??
    amenitiesError ??
    highlightError ??
    customLinksError ??
    customAmenitiesError

  if (error) {
    throw new Error(`[fetchPropertyBundles] ${error.message}`)
  }

  const catalog = mapCustomAmenityRows(customAmenityRows ?? [])
  const propertyList = properties ?? []

  const imagesByProperty = groupBy(images ?? [], (row) => row.property_id)
  const amenitiesByProperty = groupBy(amenities ?? [], (row) => row.property_id)
  const highlightByProperty = groupBy(highlightAmenities ?? [], (row) => row.property_id)
  const customLinksByProperty = groupBy(customAmenityLinks ?? [], (row) => row.property_id)

  const bundles: PropertyRowBundle[] = propertyList.map((property) => {
    const links = customLinksByProperty.get(property.id) ?? []
    const customAmenityIds = links.map((link) => link.custom_amenity_id)
    const highlightCustomAmenities = links.filter((link) => link.is_highlight).map((link) => link.custom_amenity_id)

    return {
      property,
      images: imagesByProperty.get(property.id) ?? [],
      amenities: (amenitiesByProperty.get(property.id) ?? [])
        .map((row) => row.amenity_id)
        .filter(isCatalogAmenity),
      highlightAmenities: (highlightByProperty.get(property.id) ?? [])
        .map((row) => row.amenity_id)
        .filter(isCatalogAmenity),
      customAmenityIds,
      highlightCustomAmenities,
      customAmenityCatalog: catalog,
    }
  })

  return { bundles, catalog }
}

export async function fetchDashboardProperties(supabase: Client) {
  const { bundles, catalog } = await fetchPropertyBundles(supabase)
  return {
    properties: bundles.map(mapPropertyRowsToDashboard),
    catalog,
  }
}

function groupBy<T, K extends string | number>(items: T[], keyFn: (item: T) => K) {
  const map = new Map<K, T[]>()
  for (const item of items) {
    const key = keyFn(item)
    const bucket = map.get(key)
    if (bucket) bucket.push(item)
    else map.set(key, [item])
  }
  return map
}

function isCatalogAmenity(value: string): value is AmenityId {
  return AMENITY_ID_SET.has(value)
}
