import type { Metadata } from "next"
import PropiedadesPageClient from "./page-client"

export const metadata: Metadata = {
  title: "Propiedades | Hospedajes Valle de Guadalupe",
  description:
    "Catálogo completo de hospedajes boutique en Valle de Guadalupe. Filtra por amenidades y reserva tu estancia.",
}

export default function PropiedadesPage() {
  return <PropiedadesPageClient />
}
