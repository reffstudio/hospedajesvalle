import type { Metadata } from "next"
import PropiedadesPageClient from "./page-client"
import { getSiteUrl, ogImage, siteName } from "@/lib/site"

const description = "Explora nuestro catálogo completo en Valle de Guadalupe y encuentra tu hospedaje ideal."
const title = "Propiedades"
const canonicalPath = "/propiedades"

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: canonicalPath,
  },
  openGraph: {
    siteName,
    title: `${title} | ${siteName}`,
    description,
    type: "website",
    url: `${getSiteUrl()}${canonicalPath}`,
    locale: "es_MX",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${siteName}`,
    description,
    images: [{ url: ogImage.url, alt: ogImage.alt }],
    site: "@hospedajesvalle",
  },
}

export default function PropiedadesPage() {
  return <PropiedadesPageClient />
}
