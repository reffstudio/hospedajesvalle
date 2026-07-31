import type { AmenityId } from "@/lib/property-amenities"
import { getTranslation } from "@/lib/i18n/translations"
import type { Locale } from "@/lib/i18n/types"

/**
 * Legacy static catalog — source of truth until Supabase is connected.
 * Used by seed-properties and the static public data provider.
 */
export type StaticLegacyProduct = {
  id: string
  name: string
  price: string
  image: string
  badge: "Nuevo" | "Popular" | "Limitado"
  materials: string[]
  quickLookImages: string[]
  dimensions: string
  amenities: AmenityId[]
  includes: string[]
}

type StaticProductBase = Omit<StaticLegacyProduct, "amenities" | "includes">

const FINCA_CORAZON_DE_ALMA_IMAGES = [
  "/properties/finca-corazon-de-alma/01-portada-aerea.png",
  "/properties/finca-corazon-de-alma/02-alberca-vinedo.png",
  "/properties/finca-corazon-de-alma/03-vista-aerea.png",
  "/properties/finca-corazon-de-alma/04-recamara.png",
  "/properties/finca-corazon-de-alma/05-suite-interior.png",
  "/properties/finca-corazon-de-alma/06-bano.png",
  "/properties/finca-corazon-de-alma/07-detalle-batas.png",
] as const

const CASA_SAMARIA_IMAGES = [
  "/properties/casa-samaria/01-portada-fachada.png",
  "/properties/casa-samaria/02-alberca-exterior.png",
  "/properties/casa-samaria/03-cascada-alberca.png",
  "/properties/casa-samaria/04-alberca-rocosa.png",
  "/properties/casa-samaria/05-sala-vista-alberca.png",
  "/properties/casa-samaria/06-recamara.png",
  "/properties/casa-samaria/07-bano.png",
] as const

const CRUZ_DEL_VALLE_IMAGES = [
  "/properties/cruz-del-valle/01-portada-exterior.png",
  "/properties/cruz-del-valle/02-alberca-comun.png",
  "/properties/cruz-del-valle/03-unidades-exterior.png",
  "/properties/cruz-del-valle/04-recamara-doble.png",
  "/properties/cruz-del-valle/05-recamara-macrame.png",
  "/properties/cruz-del-valle/06-recamara-closet.png",
] as const

const amenitiesById: Record<string, AmenityId[]> = {
  "finca-corazon-de-alma": ["pool", "jacuzzi", "fire-pit", "vineyard-view", "wifi", "bbq", "terrace"],
  "casa-samaria": ["pool", "jacuzzi", "wifi", "terrace", "bbq", "patio"],
  "cruz-del-valle": ["pool", "wifi", "bbq", "terrace", "patio", "fire-pit"],
  "suite-vinedo": ["wine-cellar", "fire-pit", "spa", "vineyard-view"],
  "casa-adobe": ["patio", "bbq", "wifi"],
  "loft-terraza": ["terrace", "fire-pit", "vineyard-view"],
}

function enrichProducts(products: StaticProductBase[], locale: Locale): StaticLegacyProduct[] {
  const includes = [...getTranslation(locale).quickLook.includesList]

  return products.map((product) => ({
    ...product,
    amenities: amenitiesById[product.id] ?? [],
    includes,
  }))
}

const productsByLocale: Record<Locale, StaticProductBase[]> = {
  es: [
    {
      id: "finca-corazon-de-alma",
      name: "Finca Corazón de Alma",
      price: "$6,900 / noche",
      image: FINCA_CORAZON_DE_ALMA_IMAGES[0],
      badge: "Popular",
      materials: ["3 recámaras", "Alberca y jacuzzi", "Fogatero y viñedo"],
      quickLookImages: [...FINCA_CORAZON_DE_ALMA_IMAGES],
      dimensions: "Hasta 8 huéspedes · 3 baños",
    },
    {
      id: "casa-samaria",
      name: "Casa Samaria",
      price: "$5,400 / noche",
      image: CASA_SAMARIA_IMAGES[0],
      badge: "Nuevo",
      materials: ["2 recámaras", "Alberca con cascada", "Diseño contemporáneo"],
      quickLookImages: [...CASA_SAMARIA_IMAGES],
      dimensions: "Hasta 6 huéspedes · 2 baños",
    },
    {
      id: "cruz-del-valle",
      name: "Cruz del Valle",
      price: "$4,800 / noche",
      image: CRUZ_DEL_VALLE_IMAGES[0],
      badge: "Popular",
      materials: ["4 recámaras", "Alberca y deck", "Estilo moderno"],
      quickLookImages: [...CRUZ_DEL_VALLE_IMAGES],
      dimensions: "Hasta 10 huéspedes · 3 baños",
    },
    {
      id: "suite-vinedo",
      name: "Suite Viñedo",
      price: "$4,200 / noche",
      image: "/vg-suite-vinedo.png",
      badge: "Popular",
      materials: ["1 recámara", "Ventanal panorámico", "Cava privada"],
      quickLookImages: ["/vg-suite-vinedo.png", "/vg-recamara-interior.png", "/vg-vinedo-atardecer.png"],
      dimensions: "Hasta 2 huéspedes · 1 baño",
    },
    {
      id: "casa-adobe",
      name: "Casa de Adobe",
      price: "$5,500 / noche",
      image: "/vg-casa-adobe.png",
      badge: "Nuevo",
      materials: ["3 recámaras", "Patio central", "Cocina de campo"],
      quickLookImages: ["/vg-casa-adobe.png", "/vg-recamara-interior.png", "/vg-alberca-noche.png"],
      dimensions: "Hasta 6 huéspedes · 3 baños",
    },
    {
      id: "loft-terraza",
      name: "Loft Terraza",
      price: "$3,900 / noche",
      image: "/vg-loft-terraza.png",
      badge: "Popular",
      materials: ["1 recámara", "Terraza lounge", "Vista al valle"],
      quickLookImages: ["/vg-loft-terraza.png", "/vg-vinedo-atardecer.png", "/vg-recamara-interior.png"],
      dimensions: "Hasta 3 huéspedes · 1 baño",
    },
  ],
  en: [
    {
      id: "finca-corazon-de-alma",
      name: "Finca Corazón de Alma",
      price: "$6,900 / night",
      image: FINCA_CORAZON_DE_ALMA_IMAGES[0],
      badge: "Popular",
      materials: ["3 bedrooms", "Pool & jacuzzi", "Fire pit & vineyard"],
      quickLookImages: [...FINCA_CORAZON_DE_ALMA_IMAGES],
      dimensions: "Up to 8 guests · 3 baths",
    },
    {
      id: "casa-samaria",
      name: "Casa Samaria",
      price: "$5,400 / night",
      image: CASA_SAMARIA_IMAGES[0],
      badge: "Nuevo",
      materials: ["2 bedrooms", "Pool with waterfall", "Contemporary design"],
      quickLookImages: [...CASA_SAMARIA_IMAGES],
      dimensions: "Up to 6 guests · 2 baths",
    },
    {
      id: "cruz-del-valle",
      name: "Cruz del Valle",
      price: "$4,800 / night",
      image: CRUZ_DEL_VALLE_IMAGES[0],
      badge: "Popular",
      materials: ["4 bedrooms", "Pool & deck", "Modern style"],
      quickLookImages: [...CRUZ_DEL_VALLE_IMAGES],
      dimensions: "Up to 10 guests · 3 baths",
    },
    {
      id: "suite-vinedo",
      name: "Vineyard Suite",
      price: "$4,200 / night",
      image: "/vg-suite-vinedo.png",
      badge: "Popular",
      materials: ["1 bedroom", "Panoramic window", "Private wine cellar"],
      quickLookImages: ["/vg-suite-vinedo.png", "/vg-recamara-interior.png", "/vg-vinedo-atardecer.png"],
      dimensions: "Up to 2 guests · 1 bath",
    },
    {
      id: "casa-adobe",
      name: "Adobe House",
      price: "$5,500 / night",
      image: "/vg-casa-adobe.png",
      badge: "Nuevo",
      materials: ["3 bedrooms", "Central patio", "Farm kitchen"],
      quickLookImages: ["/vg-casa-adobe.png", "/vg-recamara-interior.png", "/vg-alberca-noche.png"],
      dimensions: "Up to 6 guests · 3 baths",
    },
    {
      id: "loft-terraza",
      name: "Terrace Loft",
      price: "$3,900 / night",
      image: "/vg-loft-terraza.png",
      badge: "Popular",
      materials: ["1 bedroom", "Lounge terrace", "Valley view"],
      quickLookImages: ["/vg-loft-terraza.png", "/vg-vinedo-atardecer.png", "/vg-recamara-interior.png"],
      dimensions: "Up to 3 guests · 1 bath",
    },
  ],
}

export function getStaticLegacyProducts(locale: Locale): StaticLegacyProduct[] {
  return enrichProducts(productsByLocale[locale], locale)
}

export function getStaticLegacyProductCount(): number {
  return productsByLocale.es.length
}

export function getBadgeLabel(
  badge: StaticLegacyProduct["badge"],
  locale: Locale,
): string {
  const map: Record<Locale, Record<StaticLegacyProduct["badge"], string>> = {
    es: { Nuevo: "Nuevo", Popular: "Popular", Limitado: "Limitado" },
    en: { Nuevo: "New", Popular: "Popular", Limitado: "Limited" },
  }
  return map[locale][badge]
}
