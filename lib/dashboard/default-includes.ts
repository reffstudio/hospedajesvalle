import { getTranslation } from "@/lib/i18n/translations"

export function createDefaultPropertyIncludes() {
  return [...getTranslation("es").quickLook.includesList]
}

export function normalizePropertyIncludes(items: string[] | undefined) {
  if (items === undefined) return createDefaultPropertyIncludes()
  return items.map((item) => item.trim()).filter(Boolean)
}
