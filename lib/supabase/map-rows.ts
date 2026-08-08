import type { CustomAmenityDefinition, DashboardProperty, DashboardPropertyInput } from "@/lib/dashboard/types"
import type { PropertyImageRow, PropertyRow } from "@/lib/supabase/database.types"
import type { AmenityId } from "@/lib/property-amenities"
import { isPropertyStayType, type PropertyStayType } from "@/lib/property-stay-type"

export type PropertyRowBundle = {
  property: PropertyRow
  images: PropertyImageRow[]
  amenities: AmenityId[]
  highlightAmenities: AmenityId[]
  customAmenityIds: string[]
  highlightCustomAmenities: string[]
  customAmenityCatalog: CustomAmenityDefinition[]
}

function parseIncludes(value: PropertyRow["includes"]): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

export function mapPropertyRowsToDashboard(bundle: PropertyRowBundle): DashboardProperty {
  const { property, images, amenities, highlightAmenities, customAmenityIds, highlightCustomAmenities } =
    bundle

  return {
    id: property.id,
    slug: property.slug,
    name: property.name,
    priceLabel: property.price_label,
    currency: property.currency,
    status: property.status,
    stayType: isPropertyStayType(property.stay_type) ? property.stay_type : "private",
    featured: property.featured,
    featuredOrder: property.featured_order,
    amenities,
    highlightAmenities,
    customAmenityIds,
    highlightCustomAmenities,
    maxGuests: property.max_guests,
    bedrooms: property.bedrooms,
    fullBathrooms: property.full_bathrooms,
    halfBathrooms: property.half_bathrooms,
    includes: parseIncludes(property.includes),
    images: [...images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => ({
        id: image.id,
        url: image.public_url,
        storagePath: image.storage_path,
        sortOrder: image.sort_order,
        isCover: image.is_cover,
      })),
    updatedAt: property.updated_at,
  }
}

export function mapDashboardInputToPropertyRow(
  input: DashboardPropertyInput,
  id?: string,
): PropertyRow {
  const now = new Date().toISOString()

  return {
    id: id ?? crypto.randomUUID(),
    slug: input.slug,
    name: input.name.trim(),
    price_label: input.priceLabel.trim(),
    currency: input.currency,
    status: input.status,
    stay_type: input.stayType,
    featured: input.featured,
    featured_order: input.featured ? input.featuredOrder : null,
    max_guests: input.maxGuests,
    bedrooms: input.bedrooms,
    full_bathrooms: input.fullBathrooms,
    half_bathrooms: input.halfBathrooms,
    includes: input.includes,
    created_at: now,
    updated_at: now,
  }
}

export function mapDashboardInputToPropertyUpdate(input: Partial<DashboardPropertyInput>) {
  const patch: Record<string, unknown> = {}

  if (input.slug !== undefined) patch.slug = input.slug
  if (input.name !== undefined) patch.name = input.name.trim()
  if (input.priceLabel !== undefined) patch.price_label = input.priceLabel.trim()
  if (input.currency !== undefined) patch.currency = input.currency
  if (input.status !== undefined) patch.status = input.status
  if (input.stayType !== undefined) patch.stay_type = input.stayType
  if (input.featured !== undefined) patch.featured = input.featured
  if (input.featuredOrder !== undefined) patch.featured_order = input.featured ? input.featuredOrder : null
  if (input.maxGuests !== undefined) patch.max_guests = input.maxGuests
  if (input.bedrooms !== undefined) patch.bedrooms = input.bedrooms
  if (input.fullBathrooms !== undefined) patch.full_bathrooms = input.fullBathrooms
  if (input.halfBathrooms !== undefined) patch.half_bathrooms = input.halfBathrooms
  if (input.includes !== undefined) patch.includes = input.includes

  return patch
}

export type PropertyImageInsert = {
  id: string
  property_id: string
  storage_path: string
  public_url: string
  sort_order: number
  is_cover: boolean
}

export function mapDashboardImagesToRows(
  propertyId: string,
  images: DashboardPropertyInput["images"],
): PropertyImageInsert[] {
  return [...images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image, index) => ({
      id: isUuid(image.id) ? image.id : crypto.randomUUID(),
      property_id: propertyId,
      storage_path: image.storagePath ?? `legacy/${propertyId}/${image.id}`,
      public_url: image.url,
      sort_order: index,
      is_cover: index === 0,
    }))
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export function resolveStayType(value: string | null | undefined): PropertyStayType {
  return value && isPropertyStayType(value) ? value : "private"
}
