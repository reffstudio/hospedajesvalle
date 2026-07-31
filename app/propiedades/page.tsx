import type { Metadata } from "next"
import PropiedadesPageClient from "./page-client"

export const metadata: Metadata = {
  title: "Propiedades | Hospedajes Valle de Guadalupe",
  description:
    "Catálogo completo de hospedajes boutique en Valle de Guadalupe. Filtra por amenidades y reserva tu estancia.",
  openGraph: {
    title: "Propiedades | Hospedajes Valle de Guadalupe",
    description:
      "Catálogo completo de hospedajes boutique en Valle de Guadalupe. Filtra por amenidades y reserva tu estancia.",
    images: [{ url: "/og-share.png", alt: "Hospedajes en Valle de Guadalupe — logo sobre viñedos del valle" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Propiedades | Hospedajes Valle de Guadalupe",
    images: [{ url: "/og-share.png", alt: "Hospedajes en Valle de Guadalupe — logo sobre viñedos del valle" }],
  },
}

export default function PropiedadesPage() {
  return <PropiedadesPageClient />
}
