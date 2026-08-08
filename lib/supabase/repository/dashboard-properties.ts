import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"
import type {
  CustomAmenityDefinition,
  DashboardProperty,
  DashboardPropertyInput,
  PropertyImage,
} from "@/lib/dashboard/types"
import type { CustomAmenityIconId } from "@/lib/custom-amenity-icons"
import {
  normalizeCustomAmenityIds,
  normalizeHighlightCustomAmenities,
  createCustomAmenityDefinition,
} from "@/lib/dashboard/custom-amenity-catalog"
import { normalizeHighlightAmenities } from "@/lib/dashboard/card-highlights"
import { normalizePropertyIncludes } from "@/lib/dashboard/default-includes"
import { normalizePriceLabel } from "@/lib/dashboard/price"
import { ensureUniquePropertySlug } from "@/lib/dashboard/property-slug"
import {
  isUuid,
  mapDashboardImagesToRows,
  mapDashboardInputToPropertyRow,
  mapDashboardInputToPropertyUpdate,
  mapPropertyRowsToDashboard,
} from "@/lib/supabase/map-rows"
import { fetchPropertyBundles } from "@/lib/supabase/queries/property-bundles"
import { uploadPropertyImageFile } from "@/lib/supabase/storage/property-images"

type Client = SupabaseClient<Database>

function normalizeInput(input: DashboardPropertyInput, catalog: CustomAmenityDefinition[]): DashboardPropertyInput {
  const customAmenityIds = normalizeCustomAmenityIds(input.customAmenityIds, catalog)

  return {
    ...input,
    priceLabel: normalizePriceLabel(input.priceLabel),
    highlightAmenities: normalizeHighlightAmenities(input.highlightAmenities, input.amenities),
    customAmenityIds,
    highlightCustomAmenities: normalizeHighlightCustomAmenities(
      input.highlightCustomAmenities,
      customAmenityIds,
    ),
    includes: normalizePropertyIncludes(input.includes),
  }
}

async function ensureCustomAmenitiesCatalog(
  supabase: Client,
  catalog: CustomAmenityDefinition[],
  ids: string[],
): Promise<{ catalog: CustomAmenityDefinition[]; idRemap: Map<string, string> }> {
  const idRemap = new Map<string, string>()
  let nextCatalog = [...catalog]

  for (const id of ids) {
    const definition = nextCatalog.find((item) => item.id === id)
    if (!definition) continue

    if (isUuid(id)) {
      const { error } = await supabase.from("custom_amenities").upsert({
        id,
        label: definition.label,
        icon_id: definition.iconId,
      })

      if (error) {
        throw new Error(`[ensureCustomAmenitiesCatalog] ${error.message}`)
      }

      idRemap.set(id, id)
      continue
    }

    const { data, error } = await supabase
      .from("custom_amenities")
      .insert({
        label: definition.label,
        icon_id: definition.iconId,
      })
      .select("*")
      .single()

    if (error) {
      throw new Error(`[ensureCustomAmenitiesCatalog] ${error.message}`)
    }

    const created: CustomAmenityDefinition = {
      id: data.id,
      label: data.label,
      iconId: data.icon_id as CustomAmenityIconId,
    }

    nextCatalog = nextCatalog.map((item) => (item.id === id ? created : item))
    if (!nextCatalog.some((item) => item.id === created.id)) {
      nextCatalog.push(created)
    }

    idRemap.set(id, created.id)
  }

  return { catalog: nextCatalog, idRemap }
}

async function resolveImagesForSave(
  supabase: Client,
  propertyId: string,
  images: PropertyImage[],
): Promise<PropertyImage[]> {
  const resolved: PropertyImage[] = []

  for (const [index, image] of [...images].sort((a, b) => a.sortOrder - b.sortOrder).entries()) {
    const needsUpload = image.url.startsWith("blob:") || image.storagePath?.startsWith("local/")

    if (needsUpload) {
      const response = await fetch(image.url)
      const blob = await response.blob()
      const file = new File([blob], `image-${index + 1}.jpg`, { type: blob.type || "image/jpeg" })
      const uploaded = await uploadPropertyImageFile(supabase, file, propertyId)
      resolved.push({
        id: isUuid(image.id) ? image.id : crypto.randomUUID(),
        url: uploaded.url,
        storagePath: uploaded.storagePath,
        sortOrder: index,
        isCover: index === 0,
      })
      continue
    }

    resolved.push({
      ...image,
      sortOrder: index,
      isCover: index === 0,
    })
  }

  return resolved
}

async function syncPropertyRelations(
  supabase: Client,
  propertyId: string,
  input: DashboardPropertyInput,
  catalog: CustomAmenityDefinition[],
) {
  const { catalog: catalogWithEnsured, idRemap } = await ensureCustomAmenitiesCatalog(
    supabase,
    catalog,
    input.customAmenityIds,
  )

  const resolvedCustomIds = input.customAmenityIds.map((id) => idRemap.get(id) ?? id)
  const highlightCustomIds = input.highlightCustomAmenities.map((id) => idRemap.get(id) ?? id)

  await Promise.all([
    supabase.from("property_amenities").delete().eq("property_id", propertyId),
    supabase.from("property_highlight_amenities").delete().eq("property_id", propertyId),
    supabase.from("property_custom_amenities").delete().eq("property_id", propertyId),
    supabase.from("property_images").delete().eq("property_id", propertyId),
  ])

  if (input.amenities.length > 0) {
    const { error } = await supabase.from("property_amenities").insert(
      input.amenities.map((amenity_id) => ({ property_id: propertyId, amenity_id })),
    )
    if (error) throw new Error(`[syncPropertyRelations] amenities: ${error.message}`)
  }

  if (input.highlightAmenities.length > 0) {
    const { error } = await supabase.from("property_highlight_amenities").insert(
      input.highlightAmenities.map((amenity_id) => ({ property_id: propertyId, amenity_id })),
    )
    if (error) throw new Error(`[syncPropertyRelations] highlight amenities: ${error.message}`)
  }

  if (resolvedCustomIds.length > 0) {
    const { error } = await supabase.from("property_custom_amenities").insert(
      resolvedCustomIds.map((custom_amenity_id) => ({
        property_id: propertyId,
        custom_amenity_id,
        is_highlight: highlightCustomIds.includes(custom_amenity_id),
      })),
    )
    if (error) throw new Error(`[syncPropertyRelations] custom amenities: ${error.message}`)
  }

  const resolvedImages = await resolveImagesForSave(supabase, propertyId, input.images)
  const imageRows = mapDashboardImagesToRows(propertyId, resolvedImages)

  if (imageRows.length > 0) {
    const { error } = await supabase.from("property_images").insert(imageRows)
    if (error) throw new Error(`[syncPropertyRelations] images: ${error.message}`)
  }

  return catalogWithEnsured
}

async function fetchPropertyById(supabase: Client, id: string, catalog: CustomAmenityDefinition[]) {
  const { bundles } = await fetchPropertyBundles(supabase)
  const bundle = bundles.find((item) => item.property.id === id)
  if (!bundle) {
    throw new Error("Propiedad no encontrada.")
  }

  return mapPropertyRowsToDashboard({ ...bundle, customAmenityCatalog: catalog })
}

export async function listDashboardProperties(supabase: Client) {
  return fetchPropertyBundles(supabase)
}

export async function createDashboardProperty(
  supabase: Client,
  input: DashboardPropertyInput,
  catalog: CustomAmenityDefinition[],
  existing: DashboardProperty[],
) {
  const normalized = normalizeInput(input, catalog)
  const slug = ensureUniquePropertySlug(normalized.slug || normalized.name, existing)
  const propertyRow = mapDashboardInputToPropertyRow({ ...normalized, slug })

  const { error } = await supabase.from("properties").insert({
    id: propertyRow.id,
    slug: propertyRow.slug,
    name: propertyRow.name,
    price_label: propertyRow.price_label,
    currency: propertyRow.currency,
    status: propertyRow.status,
    stay_type: propertyRow.stay_type,
    featured: propertyRow.featured,
    featured_order: propertyRow.featured_order,
    max_guests: propertyRow.max_guests,
    bedrooms: propertyRow.bedrooms,
    full_bathrooms: propertyRow.full_bathrooms,
    half_bathrooms: propertyRow.half_bathrooms,
    includes: propertyRow.includes,
  })

  if (error) {
    throw new Error(`[createDashboardProperty] ${error.message}`)
  }

  const nextCatalog = await syncPropertyRelations(supabase, propertyRow.id, { ...normalized, slug }, catalog)
  return {
    property: await fetchPropertyById(supabase, propertyRow.id, nextCatalog),
    catalog: nextCatalog,
  }
}

export async function updateDashboardProperty(
  supabase: Client,
  id: string,
  input: Partial<DashboardPropertyInput>,
  catalog: CustomAmenityDefinition[],
  existing: DashboardProperty[],
) {
  const current = existing.find((property) => property.id === id)
  if (!current) {
    throw new Error("Propiedad no encontrada.")
  }

  const merged: DashboardPropertyInput = {
    slug: input.slug ?? current.slug,
    name: input.name ?? current.name,
    priceLabel: input.priceLabel ?? current.priceLabel,
    currency: input.currency ?? current.currency,
    status: input.status ?? current.status,
    stayType: input.stayType ?? current.stayType,
    featured: input.featured ?? current.featured,
    featuredOrder: input.featuredOrder ?? current.featuredOrder,
    amenities: input.amenities ?? current.amenities,
    highlightAmenities: input.highlightAmenities ?? current.highlightAmenities,
    customAmenityIds: input.customAmenityIds ?? current.customAmenityIds,
    highlightCustomAmenities: input.highlightCustomAmenities ?? current.highlightCustomAmenities,
    maxGuests: input.maxGuests ?? current.maxGuests,
    bedrooms: input.bedrooms ?? current.bedrooms,
    fullBathrooms: input.fullBathrooms ?? current.fullBathrooms,
    halfBathrooms: input.halfBathrooms ?? current.halfBathrooms,
    includes: input.includes ?? current.includes,
    images: input.images ?? current.images,
  }

  const normalized = normalizeInput(merged, catalog)
  const slug = ensureUniquePropertySlug(normalized.slug || normalized.name, existing, id)
  const patch = mapDashboardInputToPropertyUpdate({ ...normalized, slug })

  const { error } = await supabase.from("properties").update(patch).eq("id", id)
  if (error) {
    throw new Error(`[updateDashboardProperty] ${error.message}`)
  }

  const nextCatalog = await syncPropertyRelations(supabase, id, { ...normalized, slug }, catalog)
  return {
    property: await fetchPropertyById(supabase, id, nextCatalog),
    catalog: nextCatalog,
  }
}

export async function deleteDashboardProperty(supabase: Client, id: string) {
  const { error } = await supabase.from("properties").delete().eq("id", id)
  if (error) {
    throw new Error(`[deleteDashboardProperty] ${error.message}`)
  }
}

export async function reorderDashboardFeatured(supabase: Client, orderedIds: string[]) {
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("properties")
      .update({ featured: true, featured_order: index + 1 })
      .eq("id", id),
  )

  const { data: featuredRows } = await supabase.from("properties").select("id").eq("featured", true)
  const featuredSet = new Set(orderedIds)
  const toUnfeature = (featuredRows ?? []).filter((row) => !featuredSet.has(row.id))

  const unfeatureUpdates = toUnfeature.map((row) =>
    supabase.from("properties").update({ featured: false, featured_order: null }).eq("id", row.id),
  )

  const results = await Promise.all([...updates, ...unfeatureUpdates])
  const failed = results.find((result) => result.error)
  if (failed?.error) {
    throw new Error(`[reorderDashboardFeatured] ${failed.error.message}`)
  }
}

export async function addDashboardCustomAmenity(
  supabase: Client,
  input: { label: string; iconId: CustomAmenityIconId },
  catalog: CustomAmenityDefinition[],
) {
  const draft = createCustomAmenityDefinition(input.label, input.iconId, catalog)

  const { data, error } = await supabase
    .from("custom_amenities")
    .insert({
      label: draft.label,
      icon_id: draft.iconId,
    })
    .select("*")
    .single()

  if (error) {
    throw new Error(`[addDashboardCustomAmenity] ${error.message}`)
  }

  return {
    id: data.id,
    label: data.label,
    iconId: data.icon_id as CustomAmenityIconId,
  } satisfies CustomAmenityDefinition
}

export async function seedDashboardProperties(
  supabase: Client,
  seeds: DashboardPropertyInput[],
  catalog: CustomAmenityDefinition[] = [],
) {
  const { data: existingRows } = await supabase.from("properties").select("id")
  if (existingRows?.length) {
    const ids = existingRows.map((row) => row.id)
    await supabase.from("properties").delete().in("id", ids)
  }

  await supabase.from("custom_amenities").delete().neq("id", "00000000-0000-0000-0000-000000000000")

  let nextCatalog = catalog
  const created: DashboardProperty[] = []

  for (const seed of seeds) {
    const result = await createDashboardProperty(supabase, seed, nextCatalog, created)
    nextCatalog = result.catalog
    created.push(result.property)
  }

  return { properties: created, catalog: nextCatalog }
}
