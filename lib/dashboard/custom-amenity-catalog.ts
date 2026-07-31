import { slugify } from "@/lib/dashboard/property-slug"
import type { CustomAmenityDefinition } from "@/lib/dashboard/types"
import type { CustomAmenityIconId } from "@/lib/custom-amenity-icons"
import { isCustomAmenityIconId } from "@/lib/custom-amenity-icons"

export function makeCustomAmenityId(label: string) {
  const base = slugify(label) || "amenidad"
  return `custom-${base}`
}

export function normalizeCustomAmenityDefinition(
  item: Partial<CustomAmenityDefinition>,
): CustomAmenityDefinition | null {
  const label = item.label?.trim() ?? ""
  if (!label) return null

  return {
    id: item.id?.trim() || makeCustomAmenityId(label),
    label,
    iconId: item.iconId && isCustomAmenityIconId(item.iconId) ? item.iconId : "goal",
  }
}

export function mergeCustomAmenityCatalog(
  current: CustomAmenityDefinition[],
  incoming: CustomAmenityDefinition[],
): CustomAmenityDefinition[] {
  const next = [...current]

  for (const item of incoming) {
    const byId = next.find((entry) => entry.id === item.id)
    if (byId) {
      byId.label = item.label
      byId.iconId = item.iconId
      continue
    }

    const byLabel = next.find((entry) => entry.label.toLowerCase() === item.label.toLowerCase())
    if (byLabel) {
      byLabel.iconId = item.iconId
      continue
    }

    next.push(item)
  }

  return next
}

export function findCustomAmenityByLabel(catalog: CustomAmenityDefinition[], label: string) {
  const normalized = label.trim().toLowerCase()
  return catalog.find((item) => item.label.toLowerCase() === normalized)
}

export function createCustomAmenityDefinition(label: string, iconId: CustomAmenityIconId, catalog: CustomAmenityDefinition[]) {
  const existing = findCustomAmenityByLabel(catalog, label)
  if (existing) return existing

  const baseId = makeCustomAmenityId(label)
  const taken = new Set(catalog.map((item) => item.id))
  let id = baseId
  let suffix = 2

  while (taken.has(id)) {
    id = `${baseId}-${suffix}`
    suffix += 1
  }

  return { id, label: label.trim(), iconId }
}

export function normalizeCustomAmenityIds(ids: string[] | undefined, catalog: CustomAmenityDefinition[]) {
  const allowed = new Set(catalog.map((item) => item.id))
  return (ids ?? []).filter((id) => allowed.has(id))
}

export function normalizeHighlightCustomAmenities(
  highlightIds: string[] | undefined,
  selectedIds: string[],
) {
  const allowed = new Set(selectedIds)
  return (highlightIds ?? []).filter((id) => allowed.has(id))
}
