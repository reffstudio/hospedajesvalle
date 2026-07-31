import { buildAmenityListItems, type AmenityListItem } from "@/lib/amenity-list"
import { buildCardHighlights } from "@/lib/dashboard/card-highlights"
import { formatDimensionsLabel } from "@/lib/dashboard/property-content"
import { formatPropertyPrice } from "@/lib/dashboard/price"
import type { CustomAmenityDefinition, DashboardProperty, DashboardPropertyInput } from "@/lib/dashboard/types"
import type { Locale } from "@/lib/i18n/types"
import type { PublicProperty } from "./types"

export const PUBLIC_PROPERTY_FALLBACK_IMAGE = "/fondo-valle-1.png"

function sortedImages(images: DashboardPropertyInput["images"]) {
  return [...images].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function resolvePropertyCoverUrl(images: DashboardPropertyInput["images"]): string {
  const ordered = sortedImages(images)
  const cover = ordered.find((item) => item.isCover) ?? ordered[0]
  return cover?.url ?? PUBLIC_PROPERTY_FALLBACK_IMAGE
}

export function resolvePropertyGalleryUrls(images: DashboardPropertyInput["images"]): string[] {
  const ordered = sortedImages(images)
  if (ordered.length === 0) return [PUBLIC_PROPERTY_FALLBACK_IMAGE]

  const cover = ordered.find((item) => item.isCover) ?? ordered[0]
  const rest = ordered.filter((item) => item.id !== cover.id)
  return [cover.url, ...rest.map((item) => item.url)]
}

export function mapDashboardPropertyToPublic(
  property: DashboardProperty | DashboardPropertyInput,
  customAmenityCatalog: CustomAmenityDefinition[],
  locale: Locale,
  meta?: Pick<DashboardProperty, "id" | "slug" | "status" | "featured" | "featuredOrder" | "updatedAt">,
): PublicProperty {
  const id = meta?.id ?? ("id" in property ? property.id : "preview")
  const slug = meta?.slug ?? ("slug" in property ? property.slug : id)
  const gallery = resolvePropertyGalleryUrls(property.images)

  return {
    id,
    slug,
    name: property.name.trim() || (locale === "es" ? "Propiedad" : "Property"),
    price: formatPropertyPrice(property.priceLabel, property.currency) || (locale === "es" ? "Precio por noche" : "Price per night"),
    image: resolvePropertyCoverUrl(property.images),
    badge: property.badge ?? undefined,
    materials: buildCardHighlights(
      {
        bedrooms: property.bedrooms,
        fullBathrooms: property.fullBathrooms,
        halfBathrooms: property.halfBathrooms,
        highlightAmenities: property.highlightAmenities,
        highlightCustomAmenities: property.highlightCustomAmenities,
      },
      customAmenityCatalog,
    ),
    amenityItems: buildAmenityListItems(
      property.amenities,
      property.customAmenityIds,
      customAmenityCatalog,
      locale,
    ),
    quickLookImages: gallery,
    dimensions: formatDimensionsLabel(property, locale),
    amenities: property.amenities,
    includes: property.includes,
    status: meta?.status ?? ("status" in property ? property.status : "published"),
    featured: meta?.featured ?? ("featured" in property ? property.featured : false),
    featuredOrder: meta?.featuredOrder ?? ("featuredOrder" in property ? property.featuredOrder : null),
  }
}

/** Subset used by dashboard preview — same mapper, stable preview id. */
export type PropertyPreviewProduct = Pick<
  PublicProperty,
  | "id"
  | "name"
  | "price"
  | "image"
  | "badge"
  | "materials"
  | "amenityItems"
  | "quickLookImages"
  | "dimensions"
  | "amenities"
  | "includes"
>

export function mapDashboardPropertyToPreview(
  form: DashboardPropertyInput,
  customAmenityCatalog: CustomAmenityDefinition[],
  id = "preview",
  locale: Locale = "es",
): PropertyPreviewProduct {
  const mapped = mapDashboardPropertyToPublic(form, customAmenityCatalog, locale, {
    id,
    slug: form.slug,
    status: form.status,
    featured: form.featured,
    featuredOrder: form.featuredOrder,
    updatedAt: new Date().toISOString(),
  })

  return {
    id: mapped.id,
    name: mapped.name,
    price: mapped.price,
    image: mapped.image,
    badge: mapped.badge,
    materials: mapped.materials,
    amenityItems: mapped.amenityItems,
    quickLookImages: mapped.quickLookImages,
    dimensions: mapped.dimensions,
    amenities: mapped.amenities,
    includes: mapped.includes,
  }
}

export function getPropertyPreviewIssues(form: DashboardPropertyInput) {
  const issues: string[] = []
  if (!form.name.trim()) issues.push("Agrega un nombre para ver el título en la tarjeta.")
  if (form.images.length === 0) issues.push("Agrega al menos una imagen para la vista previa.")
  if (!form.priceLabel.trim()) issues.push("Define un precio para mostrarlo en la tarjeta.")
  return issues
}

/** @deprecated Prefer amenityItems on PublicProperty */
export function publicPropertyAmenityItems(product: PublicProperty): AmenityListItem[] {
  return product.amenityItems
}
