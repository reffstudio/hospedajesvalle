import Link from "next/link"
import type { Metadata } from "next"
import { siteName } from "@/lib/site"

export const metadata: Metadata = {
  title: `Página no encontrada | ${siteName}`,
  description: "La página que buscas no existe o fue movida.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-valle-sage-50 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-valle-forest-500">404</p>
      <h1 className="mt-3 text-3xl font-semibold text-valle-forest-900 sm:text-4xl">Página no encontrada</h1>
      <p className="mt-4 max-w-md text-valle-forest-600">
        La página que buscas no existe o fue movida. Regresa al inicio o explora nuestro catálogo.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-valle-wine-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-valle-wine-800"
        >
          Ir al inicio
        </Link>
        <Link
          href="/propiedades"
          className="rounded-full border border-valle-sage-300 bg-white px-6 py-3 text-sm font-semibold text-valle-forest-800 transition-colors hover:bg-valle-sage-100"
        >
          Ver propiedades
        </Link>
      </div>
    </main>
  )
}
