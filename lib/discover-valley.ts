export type DiscoverValleyFilterCategory = "vinas" | "gastronomia" | "firepit" | "pool" | "views"

export type DiscoverValleyGalleryItem = {
  id: string
  filterCategory: DiscoverValleyFilterCategory
  image: string
}

export const discoverValleyGallery: DiscoverValleyGalleryItem[] = [
  {
    id: "ruta-del-vino",
    filterCategory: "vinas",
    image: "/images/experiences/ruta-del-vino.png",
  },
  {
    id: "alta-gastronomia",
    filterCategory: "gastronomia",
    image: "/images/experiences/gastronomia.jpg",
  },
  {
    id: "atardeceres-y-fuego",
    filterCategory: "firepit",
    image: "/images/experiences/atardeceres-y-fuego.png",
  },
  {
    id: "relax-y-bienestar",
    filterCategory: "pool",
    image: "/images/experiences/relax-y-bienestar.png",
  },
  {
    id: "paisajes-de-ensueno",
    filterCategory: "views",
    image: "/images/experiences/paisajes-de-ensueno.png",
  },
]

import { PROPERTY_FILTER_SESSION_KEY } from "@/lib/data/storage-keys"

/** @deprecated Use PROPERTY_FILTER_SESSION_KEY from lib/data/storage-keys */
export const PROPERTY_FILTER_STORAGE_KEY = PROPERTY_FILTER_SESSION_KEY

export function scrollToProperties(filterCategory?: DiscoverValleyFilterCategory) {
  if (typeof window !== "undefined" && filterCategory) {
    sessionStorage.setItem(PROPERTY_FILTER_STORAGE_KEY, filterCategory)
  }
  document.getElementById("propiedades")?.scrollIntoView({ behavior: "smooth" })
}

/** Vertical offset so `index` sits in the center of the menu viewport */
export function menuOffsetForIndex(index: number, slotHeight: number) {
  return slotHeight * (1 - index)
}

export function menuDragConstraints(itemCount: number, slotHeight: number) {
  return {
    top: slotHeight * (2 - itemCount),
    bottom: slotHeight,
  }
}
