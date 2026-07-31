export const AMENITY_IDS = [
  "pool",
  "jacuzzi",
  "wifi",
  "fire-pit",
  "terrace",
  "vineyard-view",
  "wine-cellar",
  "spa",
  "pet-friendly",
  "breakfast",
  "bbq",
  "patio",
] as const

export type AmenityId = (typeof AMENITY_IDS)[number]

export function filterProductsByAmenities<T extends { amenities: AmenityId[] }>(
  products: T[],
  selected: AmenityId[],
): T[] {
  if (selected.length === 0) return products
  return products.filter((product) => selected.every((id) => product.amenities.includes(id)))
}
