import type { Locale } from "@/lib/i18n/types"
import type { AmenityId } from "@/lib/property-amenities"
import { getPublishedProperties } from "@/lib/properties/queries"
import type { PublicProperty } from "@/lib/properties/types"
import { GUEST_PROFILES } from "./guest-profiles"
import { REVIEW_TEMPLATES } from "./templates"
import type { DisplayReview, GuestProfile, ReviewTemplate } from "./types"

const DISPLAY_COUNT = 4

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleWithRng<T>(items: T[], rng: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function templateMatchesProperty(template: ReviewTemplate, amenities: AmenityId[]) {
  return template.requiredAmenities.every((id) => amenities.includes(id))
}

function scoreTemplate(template: ReviewTemplate, amenities: AmenityId[]) {
  if (!templateMatchesProperty(template, amenities)) return -1
  return template.requiredAmenities.length
}

function pickTemplateForProperty(
  property: PublicProperty,
  usedTemplateIds: Set<string>,
  rng: () => number,
): ReviewTemplate {
  const eligible = REVIEW_TEMPLATES.filter(
    (template) => templateMatchesProperty(template, property.amenities) && !usedTemplateIds.has(template.id),
  )

  if (eligible.length === 0) {
    const generic = REVIEW_TEMPLATES.filter(
      (template) => template.requiredAmenities.length === 0 && !usedTemplateIds.has(template.id),
    )
    if (generic.length > 0) {
      return generic[Math.floor(rng() * generic.length)]
    }
    return REVIEW_TEMPLATES[Math.floor(rng() * REVIEW_TEMPLATES.length)]
  }

  const maxScore = Math.max(...eligible.map((template) => scoreTemplate(template, property.amenities)))
  const best = eligible.filter((template) => scoreTemplate(template, property.amenities) === maxScore)
  return best[Math.floor(rng() * best.length)]
}

function formatReviewDate(locale: Locale, rng: () => number) {
  const now = new Date()
  const monthsBack = Math.floor(rng() * 18)
  const date = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)
  const monthIndex = date.getMonth()
  const year = date.getFullYear()
  const monthLabel = locale === "es" ? MONTHS_ES[monthIndex] : MONTHS_EN[monthIndex]
  return `${monthLabel} ${year}`
}

function pickRating(rng: () => number) {
  return rng() < 0.85 ? 5 : 4
}

function buildReview(
  property: PublicProperty,
  guest: GuestProfile,
  template: ReviewTemplate,
  locale: Locale,
  rng: () => number,
): DisplayReview {
  return {
    id: `${property.slug}-${template.id}-${guest.id}`,
    name: guest.name,
    origin: guest.origin[locale],
    property: property.name,
    product: property,
    quote: locale === "es" ? template.es : template.en,
    date: formatReviewDate(locale, rng),
    rating: pickRating(rng),
  }
}

export type PickDisplayReviewsOptions = {
  count?: number
  /** Omit for random selection on each call (e.g. client mount). */
  seed?: number
  properties?: import("@/lib/properties/types").PublicProperty[]
}

/**
 * Builds review cards from published properties + amenity-matched quote templates.
 * No admin input required — property names always come from the live catalog.
 */
export function pickDisplayReviews(
  locale: Locale,
  options: PickDisplayReviewsOptions = {},
): DisplayReview[] {
  const count = options.count ?? DISPLAY_COUNT
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31)
  const rng = mulberry32(seed)

  const properties = shuffleWithRng(options.properties ?? getPublishedProperties(locale), rng)
  if (properties.length === 0) return []

  const guests = shuffleWithRng(GUEST_PROFILES, rng)
  const usedTemplateIds = new Set<string>()
  const reviews: DisplayReview[] = []

  for (let i = 0; i < count; i += 1) {
    const property = properties[i % properties.length]
    const guest = guests[i % guests.length]
    const template = pickTemplateForProperty(property, usedTemplateIds, rng)
    usedTemplateIds.add(template.id)
    reviews.push(buildReview(property, guest, template, locale, rng))
  }

  return reviews
}
