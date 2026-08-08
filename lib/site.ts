/** Canonical public site URL — used for metadata, sitemap, and JSON-LD. */
export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (configured) return configured
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

export const siteName = "Hospedajes en Valle de Guadalupe"

export const siteDescription =
  "Una selección de propiedades en el corazón del Valle de Guadalupe. Visita el sitio y encuentra tu próxima estancia."

export const ogDescription = "Una selección de propiedades en el corazón del Valle de Guadalupe."

export const ogImage = {
  url: "/og-share.jpg",
  alt: "Hospedajes en Valle de Guadalupe — logo sobre viñedos del valle al atardecer",
  width: 1200,
  height: 630,
  type: "image/jpeg" as const,
}
