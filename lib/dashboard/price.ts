import type { PropertyCurrency } from "./types"

export const currencyOptions: { value: PropertyCurrency; label: string; flag: string }[] = [
  { value: "MXN", label: "MXN", flag: "🇲🇽" },
  { value: "USD", label: "USD", flag: "🇺🇸" },
]

/** Strips legacy suffixes like "/ noche" from stored price strings. */
export function normalizePriceLabel(value: string) {
  return value.replace(/\s*\/\s*(noche|night)\b.*$/i, "").trim()
}

export function formatPropertyPrice(priceLabel: string, currency: PropertyCurrency) {
  const amount = normalizePriceLabel(priceLabel)
  if (!amount) return ""
  return `${amount} ${currency}`
}

export function parseLegacyPrice(priceLabel: string): { priceLabel: string; currency: PropertyCurrency } {
  return {
    priceLabel: normalizePriceLabel(priceLabel),
    currency: "MXN",
  }
}
