import type { DashboardProperty } from "./types"

export type CapacityFields = Pick<DashboardProperty, "maxGuests" | "bedrooms" | "fullBathrooms" | "halfBathrooms">

const CAPACITY_HIGHLIGHT_PATTERN =
  /^\d+(\.\d+)?\s*(rec[aá]maras?|bedrooms?|bedroom|hu[eé]spedes?|guests?|guest|ba[nñ]os?|baths?|bath|medios?\s*ba[nñ]os?)\b/i

export { CAPACITY_HIGHLIGHT_PATTERN }

export function getTotalBathrooms(fullBathrooms: number, halfBathrooms: number) {
  return fullBathrooms + halfBathrooms * 0.5
}

export function parseBathrooms(value: number) {
  if (!Number.isInteger(value)) {
    const fullBathrooms = Math.floor(value)
    const halfBathrooms = Math.round((value - fullBathrooms) / 0.5)
    return { fullBathrooms, halfBathrooms }
  }

  return { fullBathrooms: value, halfBathrooms: 0 }
}

function formatTotalValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "")
}

export function formatBathroomLabel(fullBathrooms: number, halfBathrooms: number, locale: "es" | "en") {
  const total = getTotalBathrooms(fullBathrooms, halfBathrooms)
  const amount = formatTotalValue(total)

  if (locale === "es") {
    return total === 1 ? `${amount} baño` : `${amount} baños`
  }

  return total === 1 ? `${amount} bath` : `${amount} baths`
}

export function formatBathroomBreakdown(fullBathrooms: number, halfBathrooms: number, locale: "es" | "en") {
  if (halfBathrooms === 0) return null

  if (locale === "es") {
    const parts: string[] = []
    if (fullBathrooms > 0) {
      parts.push(fullBathrooms === 1 ? "1 baño completo" : `${fullBathrooms} baños completos`)
    }
    parts.push(halfBathrooms === 1 ? "1 medio baño" : `${halfBathrooms} medios baños`)
    return parts.join(" · ")
  }

  const parts: string[] = []
  if (fullBathrooms > 0) {
    parts.push(fullBathrooms === 1 ? "1 full bath" : `${fullBathrooms} full baths`)
  }
  parts.push(halfBathrooms === 1 ? "1 half bath" : `${halfBathrooms} half baths`)
  return parts.join(" · ")
}

export function formatDimensionsLabel(capacity: CapacityFields, locale: "es" | "en") {
  const { maxGuests, bedrooms, fullBathrooms, halfBathrooms } = capacity

  if (locale === "es") {
    const guestLabel = maxGuests === 1 ? "huésped" : "huéspedes"
    const bedroomLabel = bedrooms === 1 ? "recámara" : "recámaras"
    const bathroomLabel = formatBathroomLabel(fullBathrooms, halfBathrooms, "es")
    return `Hasta ${maxGuests} ${guestLabel} · ${bedrooms} ${bedroomLabel} · ${bathroomLabel}`
  }

  const guestLabel = maxGuests === 1 ? "guest" : "guests"
  const bedroomLabel = bedrooms === 1 ? "bedroom" : "bedrooms"
  const bathroomLabel = formatBathroomLabel(fullBathrooms, halfBathrooms, "en")
  return `Up to ${maxGuests} ${guestLabel} · ${bedrooms} ${bedroomLabel} · ${bathroomLabel}`
}

/** @deprecated Use filterLegacyMarketingLines from card-highlights */
export function filterMarketingHighlights(highlights: string[]) {
  return highlights.map((item) => item.trim()).filter(Boolean).filter((item) => !CAPACITY_HIGHLIGHT_PATTERN.test(item))
}

export function getPropertyDimensionsLabel(property: CapacityFields, locale: "es" | "en") {
  return formatDimensionsLabel(property, locale)
}
