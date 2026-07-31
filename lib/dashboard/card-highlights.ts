import { AMENITY_CATALOG, getAmenityLabel } from "@/lib/amenity-catalog"
import type { AmenityId } from "@/lib/property-amenities"
import type { CustomAmenityDefinition, DashboardProperty } from "./types"
import {
  CAPACITY_HIGHLIGHT_PATTERN,
  formatBathroomLabel,
  getTotalBathrooms,
} from "./property-content"

export { CAPACITY_HIGHLIGHT_PATTERN }

type CardHighlightSource = Pick<
  DashboardProperty,
  "bedrooms" | "fullBathrooms" | "halfBathrooms" | "highlightAmenities" | "highlightCustomAmenities"
>

export function formatBedroomHighlight(bedrooms: number) {
  if (bedrooms <= 0) return null
  return bedrooms === 1 ? "1 recámara" : `${bedrooms} recámaras`
}

export function formatBathroomHighlight(fullBathrooms: number, halfBathrooms: number) {
  if (getTotalBathrooms(fullBathrooms, halfBathrooms) <= 0) return null
  return formatBathroomLabel(fullBathrooms, halfBathrooms, "es")
}

export function buildCardHighlights(
  property: CardHighlightSource,
  customAmenityCatalog: CustomAmenityDefinition[] = [],
) {
  const lines: string[] = []

  const bedroom = formatBedroomHighlight(property.bedrooms)
  if (bedroom) lines.push(bedroom)

  const bathroom = formatBathroomHighlight(property.fullBathrooms, property.halfBathrooms)
  if (bathroom) lines.push(bathroom)

  for (const amenity of AMENITY_CATALOG) {
    if (property.highlightAmenities.includes(amenity.id)) {
      lines.push(getAmenityLabel(amenity.id, "es"))
    }
  }

  for (const id of property.highlightCustomAmenities) {
    const item = customAmenityCatalog.find((entry) => entry.id === id)
    if (item) lines.push(item.label)
  }

  return lines
}

export function filterLegacyMarketingLines(highlights: string[]) {
  return highlights.map((item) => item.trim()).filter(Boolean).filter((item) => !CAPACITY_HIGHLIGHT_PATTERN.test(item))
}

function materialMatchesAmenity(material: string, amenityId: AmenityId) {
  const materialLower = material.toLowerCase()
  const labels = [getAmenityLabel(amenityId, "es"), getAmenityLabel(amenityId, "en")].map((label) =>
    label.toLowerCase(),
  )

  return labels.some((label) => {
    const tokens = label.split(/[\s/]+/).filter((token) => token.length > 3)
    return tokens.some((token) => materialLower.includes(token)) || materialLower.includes(label)
  })
}

export function inferHighlightAmenities(materials: string[], amenities: AmenityId[]) {
  const marketing = filterLegacyMarketingLines(materials)
  return amenities.filter((id) => marketing.some((line) => materialMatchesAmenity(line, id)))
}

export function normalizeHighlightAmenities(highlightAmenities: AmenityId[] | undefined, amenities: AmenityId[]) {
  const allowed = new Set(amenities)
  return (highlightAmenities ?? []).filter((id) => allowed.has(id))
}

export function migrateLegacyHighlights(
  highlights: string[] | undefined,
  amenities: AmenityId[],
  customAmenityCatalog: CustomAmenityDefinition[],
  customAmenityIds: string[],
  highlightCustomAmenities: string[],
) {
  const marketing = filterLegacyMarketingLines(highlights ?? [])
  const highlightAmenities = inferHighlightAmenities(marketing, amenities)

  const matchedMaterials = new Set(
    marketing.filter((line) => amenities.some((id) => materialMatchesAmenity(line, id))),
  )

  const nextCatalog = [...customAmenityCatalog]
  const nextIds = [...customAmenityIds]
  const nextHighlights = [...highlightCustomAmenities]

  for (const line of marketing) {
    if (matchedMaterials.has(line)) continue

    let item = nextCatalog.find((entry) => entry.label.toLowerCase() === line.toLowerCase())
    if (!item) {
      item = {
        id: `legacy-${line.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        label: line,
        iconId: "flower",
      }
      nextCatalog.push(item)
    }

    if (!nextIds.includes(item.id)) nextIds.push(item.id)
    if (!nextHighlights.includes(item.id)) nextHighlights.push(item.id)
  }

  return {
    highlightAmenities,
    customAmenityCatalog: nextCatalog,
    customAmenityIds: nextIds,
    highlightCustomAmenities: nextHighlights,
  }
}
