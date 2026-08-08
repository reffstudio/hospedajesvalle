import { buildAmenityListItems } from "@/lib/amenity-list"
import type { CustomAmenityDefinition } from "@/lib/dashboard/types"
import type { CustomAmenityIconId } from "@/lib/custom-amenity-icons"
import type { Locale } from "@/lib/i18n/types"
import type { PublicProperty } from "@/lib/properties/types"

function isHydratedAmenityItems(property: PublicProperty) {
  const first = property.amenityItems[0]
  return Boolean(first && typeof first.icon === "function")
}

export function hydratePublicPropertyAmenities(property: PublicProperty, locale: Locale): PublicProperty {
  if (isHydratedAmenityItems(property)) {
    return property
  }

  const catalog: CustomAmenityDefinition[] = (property.customAmenityDefinitions ?? []).map((entry) => ({
    id: entry.id,
    label: entry.label,
    iconId: entry.iconId as CustomAmenityIconId,
  }))

  return {
    ...property,
    amenityItems: buildAmenityListItems(property.amenities, property.customAmenityIds ?? [], catalog, locale),
  }
}

export function hydratePublicProperties(properties: PublicProperty[], locale: Locale) {
  return properties.map((property) => hydratePublicPropertyAmenities(property, locale))
}
