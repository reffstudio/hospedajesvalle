import type { LucideIcon } from "lucide-react"
import {
  Bath,
  Coffee,
  Flame,
  Mountain,
  PawPrint,
  Sparkles,
  Sun,
  Trees,
  UtensilsCrossed,
  Wifi,
  Wine,
  Waves,
} from "lucide-react"
import { AMENITY_IDS, type AmenityId } from "@/lib/property-amenities"

export type AmenityCatalogItem = {
  id: AmenityId
  es: string
  en: string
  color: string
  icon: LucideIcon
}

export const AMENITY_CATALOG: AmenityCatalogItem[] = [
  { id: "pool", es: "Alberca", en: "Pool", color: "#3b7a8c", icon: Waves },
  { id: "jacuzzi", es: "Jacuzzi", en: "Jacuzzi", color: "#3b7a8c", icon: Bath },
  { id: "wifi", es: "Wifi", en: "WiFi", color: "#6b8e5a", icon: Wifi },
  { id: "fire-pit", es: "Fogata / chimenea", en: "Fire pit / fireplace", color: "#b5651d", icon: Flame },
  { id: "terrace", es: "Terraza", en: "Terrace", color: "#b8923a", icon: Sun },
  { id: "vineyard-view", es: "Vista al valle", en: "Valley view", color: "#527364", icon: Mountain },
  { id: "wine-cellar", es: "Cava de vinos", en: "Wine cellar", color: "#7b2d3a", icon: Wine },
  { id: "spa", es: "Spa", en: "Spa", color: "#6b8e5a", icon: Sparkles },
  { id: "pet-friendly", es: "Pet friendly", en: "Pet friendly", color: "#8fa87a", icon: PawPrint },
  { id: "breakfast", es: "Desayuno incluido", en: "Breakfast included", color: "#b8923a", icon: Coffee },
  { id: "bbq", es: "Asador", en: "BBQ grill", color: "#8a5a44", icon: UtensilsCrossed },
  { id: "patio", es: "Patio", en: "Patio", color: "#b5651d", icon: Trees },
]

export const AMENITY_CATALOG_BY_ID = Object.fromEntries(
  AMENITY_CATALOG.map((item) => [item.id, item]),
) as Record<AmenityId, AmenityCatalogItem>

export function getAmenityLabel(id: AmenityId, locale: "es" | "en") {
  return AMENITY_CATALOG_BY_ID[id][locale]
}

export function isAmenityId(value: string): value is AmenityId {
  return (AMENITY_IDS as readonly string[]).includes(value)
}
