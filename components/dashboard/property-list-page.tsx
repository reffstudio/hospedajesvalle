"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Star, Trash2, X } from "lucide-react"
import { formatPropertyPrice } from "@/lib/dashboard/price"
import { usePropertyStore } from "@/lib/dashboard/property-store"
import type { DashboardProperty, PropertyStatus } from "@/lib/dashboard/types"
import type { PropertyStayType } from "@/lib/property-stay-type"
import { cn } from "@/lib/utils"

const statusLabels: Record<PropertyStatus, string> = {
  published: "Pública",
  hidden: "Oculta",
  draft: "Borrador",
}

const statusStyles: Record<PropertyStatus, string> = {
  published: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  hidden: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  draft: "bg-amber-50 text-amber-800 ring-amber-200",
}

const stayTypeLabels: Record<PropertyStayType, string> = {
  private: "Privada",
  shared: "Compartida",
  events: "Eventos",
}

function getCover(property: DashboardProperty) {
  return property.images.find((image) => image.isCover)?.url ?? property.images[0]?.url ?? "/logo-hospedajes-valle.png"
}

export function PropertyListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { properties, deleteProperty, reorderFeatured, resetToSeed, isReady, isSyncing, error } = usePropertyStore()
  const [filter, setFilter] = useState<"all" | PropertyStatus>("all")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const created = searchParams.get("created")
    const updated = searchParams.get("updated")

    if (created) {
      setSuccessMessage(`Propiedad "${created}" creada correctamente.`)
      router.replace("/dashboard/properties")
      return
    }

    if (updated) {
      setSuccessMessage("Cambios guardados correctamente.")
      router.replace("/dashboard/properties")
    }
  }, [router, searchParams])

  const featured = useMemo(
    () =>
      properties
        .filter((property) => property.featured)
        .sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999)),
    [properties],
  )

  const filtered = useMemo(() => {
    const list = filter === "all" ? properties : properties.filter((property) => property.status === filter)
    return [...list].sort((a, b) => a.name.localeCompare(b.name, "es"))
  }, [properties, filter])

  const moveFeatured = async (id: string, direction: -1 | 1) => {
    const ids = featured.map((property) => property.id)
    const index = ids.indexOf(id)
    const target = index + direction
    if (index === -1 || target < 0 || target >= ids.length) return
    const next = [...ids]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    await reorderFeatured(next)
  }

  const handleDelete = async (property: DashboardProperty) => {
    const confirmed = window.confirm(`¿Eliminar "${property.name}"? Esta acción no se puede deshacer.`)
    if (confirmed) await deleteProperty(property.id)
  }

  const handleReset = async () => {
    const confirmed = window.confirm("¿Restaurar el catálogo demo? Se reemplazarán todas las propiedades.")
    if (confirmed) await resetToSeed()
  }

  if (!isReady) {
    return <p className="text-sm text-valle-forest-600">Cargando catálogo...</p>
  }

  return (
    <div className="space-y-8">
      {successMessage ? (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p>{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="shrink-0 rounded-full p-1 text-emerald-800 hover:bg-emerald-100"
            aria-label="Cerrar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-valle-wine-200 bg-valle-wine-50 px-4 py-3 text-sm text-valle-wine-800">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-valle-forest-500">Catálogo</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-valle-forest-900 sm:text-3xl">Propiedades</h1>
          <p className="mt-2 max-w-2xl text-sm text-valle-forest-600">
            Administra el catálogo completo, las propiedades destacadas del home y su visibilidad pública.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleReset} disabled={isSyncing} className="dashboard-btn-secondary">
            Restaurar demo
          </button>
          <Link href="/dashboard/properties/new" className="dashboard-btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva propiedad
          </Link>
        </div>
      </div>

      <section className="dashboard-panel">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-valle-forest-900">Destacadas en home</h2>
            <p className="mt-1 text-sm text-valle-forest-600">
              Orden de aparición en el carrusel principal. Solo propiedades públicas deberían mostrarse.
            </p>
          </div>
          <span className="rounded-full bg-valle-sage-100 px-3 py-1 text-xs font-medium text-valle-forest-700">
            {featured.length} seleccionadas
          </span>
        </div>

        {featured.length > 0 ? (
          <div className="space-y-2">
            {featured.map((property, index) => (
              <div
                key={property.id}
                className="flex flex-col gap-3 rounded-2xl border border-valle-sage-200 bg-valle-sage-50/70 p-3 sm:flex-row sm:items-center"
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-valle-sage-200">
                  <Image src={getCover(property)} alt="" fill className="object-cover" unoptimized />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-valle-forest-900">{property.name}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-valle-forest-700 ring-1 ring-valle-sage-200">
                      <Star className="h-3 w-3 text-valle-gold-500" />
                      #{property.featuredOrder ?? index + 1}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-valle-forest-600">
                    {formatPropertyPrice(property.priceLabel, property.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-1 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => moveFeatured(property.id, -1)}
                    disabled={index === 0}
                    className={cn("dashboard-icon-btn", index === 0 && "opacity-40")}
                    aria-label="Subir en destacadas"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFeatured(property.id, 1)}
                    disabled={index === featured.length - 1}
                    className={cn("dashboard-icon-btn", index === featured.length - 1 && "opacity-40")}
                    aria-label="Bajar en destacadas"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <Link href={`/dashboard/properties/${property.id}`} className="dashboard-icon-btn">
                    <Pencil className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-valle-sage-300 px-4 py-5 text-sm text-valle-forest-500">
            No hay propiedades destacadas. Marca una propiedad como destacada desde su ficha.
          </p>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-valle-forest-900">Todas las propiedades</h2>
          <div className="flex flex-wrap gap-2">
            {(["all", "published", "hidden", "draft"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                  filter === option
                    ? "bg-valle-forest-900 text-white"
                    : "bg-white text-valle-forest-700 ring-1 ring-valle-sage-200 hover:bg-valle-sage-50",
                )}
              >
                {option === "all" ? "Todas" : statusLabels[option]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-valle-sage-200 text-[11px] uppercase tracking-[0.14em] text-valle-forest-500">
                <th className="px-3 py-3 font-semibold">Propiedad</th>
                <th className="px-3 py-3 font-semibold">Tipo</th>
                <th className="px-3 py-3 font-semibold">Estado</th>
                <th className="px-3 py-3 font-semibold">Destacada</th>
                <th className="px-3 py-3 font-semibold">Amenidades</th>
                <th className="px-3 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((property) => (
                <tr key={property.id} className="border-b border-valle-sage-100 last:border-0">
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-valle-sage-200">
                        <Image src={getCover(property)} alt="" fill className="object-cover" unoptimized />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-valle-forest-900">{property.name}</p>
                        <p className="text-xs text-valle-forest-500">
                          {formatPropertyPrice(property.priceLabel, property.currency)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className="inline-flex rounded-full bg-valle-sage-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-valle-forest-700 ring-1 ring-valle-sage-200">
                      {stayTypeLabels[property.stayType]}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ring-1",
                        statusStyles[property.status],
                      )}
                    >
                      {statusLabels[property.status]}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    {property.featured ? (
                      <span className="inline-flex items-center gap-1 text-valle-forest-800">
                        <Star className="h-3.5 w-3.5 text-valle-gold-500" />
                        #{property.featuredOrder ?? "—"}
                      </span>
                    ) : (
                      <span className="text-valle-forest-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-valle-forest-700">
                    {property.amenities.length + property.customAmenityIds.length}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/properties/${property.id}`} className="dashboard-icon-btn">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(property)}
                        className="dashboard-icon-btn text-valle-wine-700 hover:bg-valle-wine-50"
                        aria-label={`Eliminar ${property.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-valle-forest-500">No hay propiedades con este filtro.</p>
        ) : null}
      </section>

      <p className="flex items-center gap-2 text-xs text-valle-forest-500">
        <Eye className="h-3.5 w-3.5" />
        Públicas: {properties.filter((property) => property.status === "published").length}
        <span className="text-valle-sage-300">•</span>
        <EyeOff className="h-3.5 w-3.5" />
        Ocultas: {properties.filter((property) => property.status === "hidden").length}
      </p>
    </div>
  )
}
