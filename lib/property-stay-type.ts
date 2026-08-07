export const PROPERTY_STAY_TYPES = ["private", "shared", "events"] as const

export type PropertyStayType = (typeof PROPERTY_STAY_TYPES)[number]

export function filterProductsByStayType<T extends { stayType: PropertyStayType }>(
  products: T[],
  selected: PropertyStayType[],
): T[] {
  if (selected.length === 0) return products
  return products.filter((product) => selected.includes(product.stayType))
}

export function isPropertyStayType(value: string): value is PropertyStayType {
  return (PROPERTY_STAY_TYPES as readonly string[]).includes(value)
}

const stayTypeFallbackLabels: Record<PropertyStayType, string> = {
  private: "Privada",
  shared: "Compartida",
  events: "Eventos",
}

export function getStayTypeLabel(
  stayType: PropertyStayType,
  labels?: Partial<Record<PropertyStayType, string>>,
): string {
  return labels?.[stayType] ?? stayTypeFallbackLabels[stayType]
}
