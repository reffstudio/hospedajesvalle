import type { Locale } from "@/lib/i18n/types"

export type CountryCallingCode = {
  iso2: string
  dialCode: string
  name: Record<Locale, string>
}

/** México y Estados Unidos siempre arriba; el resto en orden alfabético (ES). */
const COUNTRY_CALLING_CODES: CountryCallingCode[] = [
  { iso2: "MX", dialCode: "+52", name: { es: "México", en: "Mexico" } },
  { iso2: "US", dialCode: "+1", name: { es: "Estados Unidos", en: "United States" } },
  { iso2: "CA", dialCode: "+1", name: { es: "Canadá", en: "Canada" } },
  { iso2: "AR", dialCode: "+54", name: { es: "Argentina", en: "Argentina" } },
  { iso2: "AU", dialCode: "+61", name: { es: "Australia", en: "Australia" } },
  { iso2: "AT", dialCode: "+43", name: { es: "Austria", en: "Austria" } },
  { iso2: "BE", dialCode: "+32", name: { es: "Bélgica", en: "Belgium" } },
  { iso2: "BR", dialCode: "+55", name: { es: "Brasil", en: "Brazil" } },
  { iso2: "CL", dialCode: "+56", name: { es: "Chile", en: "Chile" } },
  { iso2: "CN", dialCode: "+86", name: { es: "China", en: "China" } },
  { iso2: "CO", dialCode: "+57", name: { es: "Colombia", en: "Colombia" } },
  { iso2: "CR", dialCode: "+506", name: { es: "Costa Rica", en: "Costa Rica" } },
  { iso2: "CU", dialCode: "+53", name: { es: "Cuba", en: "Cuba" } },
  { iso2: "EC", dialCode: "+593", name: { es: "Ecuador", en: "Ecuador" } },
  { iso2: "SV", dialCode: "+503", name: { es: "El Salvador", en: "El Salvador" } },
  { iso2: "AE", dialCode: "+971", name: { es: "Emiratos Árabes Unidos", en: "United Arab Emirates" } },
  { iso2: "ES", dialCode: "+34", name: { es: "España", en: "Spain" } },
  { iso2: "FR", dialCode: "+33", name: { es: "Francia", en: "France" } },
  { iso2: "DE", dialCode: "+49", name: { es: "Alemania", en: "Germany" } },
  { iso2: "GT", dialCode: "+502", name: { es: "Guatemala", en: "Guatemala" } },
  { iso2: "HN", dialCode: "+504", name: { es: "Honduras", en: "Honduras" } },
  { iso2: "IN", dialCode: "+91", name: { es: "India", en: "India" } },
  { iso2: "IE", dialCode: "+353", name: { es: "Irlanda", en: "Ireland" } },
  { iso2: "IL", dialCode: "+972", name: { es: "Israel", en: "Israel" } },
  { iso2: "IT", dialCode: "+39", name: { es: "Italia", en: "Italy" } },
  { iso2: "JP", dialCode: "+81", name: { es: "Japón", en: "Japan" } },
  { iso2: "NL", dialCode: "+31", name: { es: "Países Bajos", en: "Netherlands" } },
  { iso2: "NZ", dialCode: "+64", name: { es: "Nueva Zelanda", en: "New Zealand" } },
  { iso2: "NI", dialCode: "+505", name: { es: "Nicaragua", en: "Nicaragua" } },
  { iso2: "NO", dialCode: "+47", name: { es: "Noruega", en: "Norway" } },
  { iso2: "PA", dialCode: "+507", name: { es: "Panamá", en: "Panama" } },
  { iso2: "PY", dialCode: "+595", name: { es: "Paraguay", en: "Paraguay" } },
  { iso2: "PE", dialCode: "+51", name: { es: "Perú", en: "Peru" } },
  { iso2: "PT", dialCode: "+351", name: { es: "Portugal", en: "Portugal" } },
  { iso2: "GB", dialCode: "+44", name: { es: "Reino Unido", en: "United Kingdom" } },
  { iso2: "DO", dialCode: "+1", name: { es: "República Dominicana", en: "Dominican Republic" } },
  { iso2: "ZA", dialCode: "+27", name: { es: "Sudáfrica", en: "South Africa" } },
  { iso2: "SE", dialCode: "+46", name: { es: "Suecia", en: "Sweden" } },
  { iso2: "CH", dialCode: "+41", name: { es: "Suiza", en: "Switzerland" } },
  { iso2: "UY", dialCode: "+598", name: { es: "Uruguay", en: "Uruguay" } },
  { iso2: "VE", dialCode: "+58", name: { es: "Venezuela", en: "Venezuela" } },
]

const PRIORITY_ISO = new Set(["MX", "US"])

export function getDefaultPhoneCountryIso(locale: Locale) {
  return locale === "en" ? "US" : "MX"
}

export function getCountryCallingCodes(locale: Locale) {
  const priority = COUNTRY_CALLING_CODES.filter((country) => PRIORITY_ISO.has(country.iso2))
  const rest = COUNTRY_CALLING_CODES.filter((country) => !PRIORITY_ISO.has(country.iso2)).sort((a, b) =>
    a.name[locale].localeCompare(b.name[locale], locale),
  )
  return [...priority, ...rest]
}

export function getCountryByIso(iso2: string) {
  return COUNTRY_CALLING_CODES.find((country) => country.iso2 === iso2)
}

export function countryFlagEmoji(iso2: string) {
  const code = iso2.toUpperCase()
  if (code.length !== 2) return "🌐"

  return String.fromCodePoint(
    ...code.split("").map((char) => 0x1f1e6 - 65 + char.charCodeAt(0)),
  )
}

export function formatCountryOptionLabel(country: CountryCallingCode, locale: Locale) {
  return `${countryFlagEmoji(country.iso2)} ${country.dialCode} ${country.name[locale]}`
}

export function formatCountryCompactLabel(country: CountryCallingCode) {
  return `${countryFlagEmoji(country.iso2)} ${country.dialCode}`
}

export function normalizeLocalPhoneDigits(value: string) {
  return value.replace(/\D/g, "")
}

export function formatFullPhoneNumber(iso2: string, localPhone: string) {
  const country = getCountryByIso(iso2)
  const digits = normalizeLocalPhoneDigits(localPhone)
  if (!country || !digits) return ""
  return `${country.dialCode}${digits}`
}

export function isValidLocalPhoneNumber(localPhone: string) {
  const digits = normalizeLocalPhoneDigits(localPhone)
  return digits.length >= 7 && digits.length <= 15
}
