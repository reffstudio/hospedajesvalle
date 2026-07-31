import type { LucideIcon } from "lucide-react"
import { AMENITY_CATALOG_BY_ID, getAmenityLabel } from "@/lib/amenity-catalog"
import type { CustomAmenityDefinition } from "@/lib/dashboard/types"
import { getCustomAmenityIcon } from "@/lib/custom-amenity-icons"
import type { AmenityId } from "@/lib/property-amenities"

export type AmenityListItem = {
  id: string
  label: string
  color: string
  icon: LucideIcon
}

export function catalogAmenitiesToListItems(ids: AmenityId[], locale: "es" | "en"): AmenityListItem[] {
  return ids.map((id) => {
    const item = AMENITY_CATALOG_BY_ID[id]
    return {
      id,
      label: getAmenityLabel(id, locale),
      color: item.color,
      icon: item.icon,
    }
  })
}

export function buildAmenityListItems(
  amenityIds: AmenityId[],
  customAmenityIds: string[],
  customAmenityCatalog: CustomAmenityDefinition[],
  locale: "es" | "en",
): AmenityListItem[] {
  const items = catalogAmenitiesToListItems(amenityIds, locale)

  for (const id of customAmenityIds) {
    const custom = customAmenityCatalog.find((entry) => entry.id === id)
    if (!custom) continue
    const icon = getCustomAmenityIcon(custom.iconId)
    items.push({
      id: custom.id,
      label: custom.label,
      color: icon.color,
      icon: icon.icon,
    })
  }

  return items
}

export function productAmenitiesToListItems(
  amenities: AmenityId[] | undefined,
  locale: "es" | "en",
): AmenityListItem[] {
  if (!amenities?.length) return []
  return catalogAmenitiesToListItems(amenities, locale)
}
