"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePropertyStore } from "@/lib/dashboard/property-store"
import { buildPropertyPreviewProduct, getPropertyPreviewIssues } from "@/lib/dashboard/property-preview"
import { createDefaultPropertyIncludes } from "@/lib/dashboard/default-includes"
import { ensureUniquePropertySlug, slugify } from "@/lib/dashboard/property-slug"
import type { DashboardPropertyInput, PropertyBadge, PropertyStatus } from "@/lib/dashboard/types"
import { AmenityFeaturePicker } from "./amenity-feature-picker"
import { PropertyIncludesEditor } from "./property-includes-editor"
import { CapacityPreview } from "./capacity-preview"
import { ImageGalleryEditor } from "./image-gallery-editor"
import { PriceCurrencyInput } from "./price-currency-input"
import { PropertyFormFloatingBar } from "./property-form-floating-bar"
import { PropertyPreviewModal } from "./property-preview-modal"

const badgeOptions: PropertyBadge[] = ["Nuevo", "Popular", "Limitado", null]
const statusOptions: PropertyStatus[] = ["published", "hidden", "draft"]

const emptyProperty = (): DashboardPropertyInput => ({
  slug: "",
  name: "",
  priceLabel: "",
  currency: "MXN",
  status: "draft",
  featured: false,
  featuredOrder: null,
  badge: null,
  amenities: [],
  highlightAmenities: [],
  customAmenityIds: [],
  highlightCustomAmenities: [],
  maxGuests: 2,
  bedrooms: 1,
  fullBathrooms: 1,
  halfBathrooms: 0,
  includes: createDefaultPropertyIncludes(),
  images: [],
})

type PropertyFormProps = {
  mode: "create" | "edit"
  propertyId?: string
}

export function PropertyForm({ mode, propertyId }: PropertyFormProps) {
  const router = useRouter()
  const { properties, customAmenityCatalog, createProperty, updateProperty, isReady } = usePropertyStore()
  const existing = useMemo(
    () => (propertyId ? properties.find((property) => property.id === propertyId) : undefined),
    [properties, propertyId],
  )

  const [form, setForm] = useState<DashboardPropertyInput>(emptyProperty)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const baseSlug = slugify(form.slug || form.name) || "propiedad"
  const resolvedSlug = useMemo(
    () => ensureUniquePropertySlug(baseSlug, properties, mode === "edit" ? propertyId : undefined),
    [baseSlug, properties, mode, propertyId],
  )
  const previewProduct = useMemo(
    () => buildPropertyPreviewProduct(form, customAmenityCatalog, resolvedSlug),
    [form, customAmenityCatalog, resolvedSlug],
  )
  const previewIssues = useMemo(() => getPropertyPreviewIssues(form), [form])

  useEffect(() => {
    if (mode === "edit" && existing) {
      const { id: _id, updatedAt: _updatedAt, ...rest } = existing
      setForm(rest)
    }
  }, [mode, existing])

  if (!isReady) {
    return <p className="text-sm text-valle-forest-600">Cargando formulario...</p>
  }

  if (mode === "edit" && !existing) {
    return (
      <div className="dashboard-panel">
        <p className="text-sm text-valle-forest-700">No se encontró la propiedad.</p>
        <Link href="/dashboard/properties" className="dashboard-btn-secondary mt-4 inline-flex">
          Volver al listado
        </Link>
      </div>
    )
  }

  const featuredCount = properties.filter((property) => property.featured && property.id !== propertyId).length

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!form.name.trim()) {
      setError("Completa el nombre de la propiedad.")
      return
    }

    if (form.images.length === 0) {
      setError("Agrega al menos una imagen.")
      return
    }

    const payload: DashboardPropertyInput = {
      ...form,
      slug: resolvedSlug,
      includes: form.includes.map((item) => item.trim()).filter(Boolean),
      featuredOrder: form.featured ? form.featuredOrder ?? featuredCount + 1 : null,
    }

    if (mode === "create") {
      const created = createProperty(payload)
      router.replace(`/dashboard/properties/${created.id}`)
      return
    }

    updateProperty(propertyId!, payload)
    if (resolvedSlug !== propertyId) {
      router.replace(`/dashboard/properties/${resolvedSlug}`)
      return
    }
    router.push("/dashboard/properties")
  }

  return (
    <>
      <form id="property-form" onSubmit={handleSubmit} className="space-y-6 pb-28">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-valle-forest-500">
              {mode === "create" ? "Nueva propiedad" : "Editar propiedad"}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-valle-forest-900 sm:text-3xl">
              {mode === "create" ? "Alta de propiedad" : form.name || "Propiedad"}
            </h1>
          </div>
          <Link href="/dashboard/properties" className="dashboard-btn-secondary">
            Cancelar
          </Link>
        </div>

      {error ? (
        <p className="rounded-xl border border-valle-wine-200 bg-valle-wine-50 px-4 py-3 text-sm text-valle-wine-800">
          {error}
        </p>
      ) : null}

      <section className="dashboard-panel space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-valle-forest-900">Información general</h2>
          <p className="mt-1 text-sm text-valle-forest-600">
            Nombre, precio, visibilidad y datos visibles en el sitio. El nombre no se traduce — coincide con redes
            sociales y marca.
          </p>
        </div>

        <label className="dashboard-field">
          <span>Nombre</span>
          <input
            className="dashboard-input"
            value={form.name}
            onChange={(event) => {
              const name = event.target.value
              setForm((prev) => ({
                ...prev,
                name,
                ...(mode === "create" && !slugManuallyEdited ? { slug: slugify(name) } : null),
              }))
            }}
            placeholder="Villa de Piedra"
          />
        </label>

        <PriceCurrencyInput
          priceLabel={form.priceLabel}
          currency={form.currency}
          onPriceChange={(priceLabel) => setForm({ ...form, priceLabel })}
          onCurrencyChange={(currency) => setForm({ ...form, currency })}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="dashboard-field">
            <span>Slug / ID URL</span>
            <input
              className="dashboard-input"
              value={mode === "create" && !slugManuallyEdited ? resolvedSlug : form.slug}
              readOnly={mode === "create" && !slugManuallyEdited}
              onChange={(event) => {
                setSlugManuallyEdited(true)
                setForm({ ...form, slug: event.target.value })
              }}
              placeholder="villa-piedra"
            />
            <span className="text-xs text-valle-forest-500">
              {mode === "create" && !slugManuallyEdited
                ? "Se genera del nombre. Si ya existe, se agrega un sufijo automáticamente."
                : resolvedSlug !== baseSlug
                  ? `Se guardará como: ${resolvedSlug}`
                  : "Identificador único en la URL."}
            </span>
            {mode === "create" && slugManuallyEdited ? (
              <button
                type="button"
                className="mt-1 text-xs font-medium text-valle-forest-700 underline-offset-2 hover:underline"
                onClick={() => {
                  setSlugManuallyEdited(false)
                  setForm((prev) => ({ ...prev, slug: slugify(prev.name) }))
                }}
              >
                Volver a generar desde el nombre
              </button>
            ) : mode === "create" ? (
              <button
                type="button"
                className="mt-1 text-xs font-medium text-valle-forest-700 underline-offset-2 hover:underline"
                onClick={() => {
                  setSlugManuallyEdited(true)
                  setForm((prev) => ({ ...prev, slug: slugify(prev.name) || prev.slug }))
                }}
              >
                Personalizar slug
              </button>
            ) : null}
          </label>

          <label className="dashboard-field">
            <span>Estado</span>
            <select
              className="dashboard-input"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as PropertyStatus })}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "published" ? "Pública" : status === "hidden" ? "Oculta" : "Borrador"}
                </option>
              ))}
            </select>
          </label>

          <label className="dashboard-field">
            <span>Badge</span>
            <select
              className="dashboard-input"
              value={form.badge ?? ""}
              onChange={(event) =>
                setForm({
                  ...form,
                  badge: (event.target.value || null) as PropertyBadge,
                })
              }
            >
              <option value="">Sin badge</option>
              {badgeOptions
                .filter((badge): badge is NonNullable<PropertyBadge> => badge !== null)
                .map((badge) => (
                  <option key={badge} value={badge}>
                    {badge}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="flex items-center gap-3 rounded-2xl border border-valle-sage-200 bg-valle-sage-50/70 px-4 py-3">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                setForm({
                  ...form,
                  featured: event.target.checked,
                  featuredOrder: event.target.checked ? form.featuredOrder ?? featuredCount + 1 : null,
                })
              }
              className="h-4 w-4 rounded border-valle-sage-300 text-valle-forest-900"
            />
            <span className="text-sm text-valle-forest-800">
              Mostrar en el carrusel de propiedades destacadas del home
            </span>
          </label>

          <label className="dashboard-field lg:min-w-[10rem]">
            <span>Orden en destacadas</span>
            <input
              type="number"
              min={1}
              className="dashboard-input"
              value={form.featuredOrder ?? ""}
              disabled={!form.featured}
              onChange={(event) =>
                setForm({
                  ...form,
                  featuredOrder: event.target.value ? Number(event.target.value) : null,
                })
              }
            />
          </label>
        </div>
      </section>

      <section className="dashboard-panel space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-valle-forest-900">Capacidad</h2>
          <p className="mt-1 text-sm text-valle-forest-600">
            Huéspedes, recámaras y baños. Usa medios baños cuando no hay regadera (solo WC y lavabo).
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="dashboard-field">
            <span>Huéspedes máx.</span>
            <input
              type="number"
              min={1}
              className="dashboard-input"
              value={form.maxGuests}
              onChange={(event) => setForm({ ...form, maxGuests: Number(event.target.value) })}
            />
          </label>
          <label className="dashboard-field">
            <span>Recámaras</span>
            <input
              type="number"
              min={0}
              className="dashboard-input"
              value={form.bedrooms}
              onChange={(event) => setForm({ ...form, bedrooms: Number(event.target.value) })}
            />
          </label>
          <label className="dashboard-field">
            <span>Baños completos</span>
            <input
              type="number"
              min={0}
              className="dashboard-input"
              value={form.fullBathrooms}
              onChange={(event) => setForm({ ...form, fullBathrooms: Number(event.target.value) })}
            />
            <span className="text-xs text-valle-forest-500">Con regadera o tina</span>
          </label>
          <label className="dashboard-field">
            <span>Medios baños</span>
            <input
              type="number"
              min={0}
              className="dashboard-input"
              value={form.halfBathrooms}
              onChange={(event) => setForm({ ...form, halfBathrooms: Number(event.target.value) })}
            />
            <span className="text-xs text-valle-forest-500">Sin regadera (WC + lavabo)</span>
          </label>
        </div>

        <CapacityPreview
          maxGuests={form.maxGuests}
          bedrooms={form.bedrooms}
          fullBathrooms={form.fullBathrooms}
          halfBathrooms={form.halfBathrooms}
        />
      </section>

      <section className="dashboard-panel space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-valle-forest-900">Amenidades y etiquetas visuales</h2>
          <p className="mt-1 text-sm text-valle-forest-600">
            Selecciona amenidades y marca con estrella las que quieras en los highlights de la tarjeta.
            Recámaras y baños se generan solos desde capacidad.
          </p>
        </div>
        <AmenityFeaturePicker
          amenities={form.amenities}
          highlightAmenities={form.highlightAmenities}
          customAmenityIds={form.customAmenityIds}
          highlightCustomAmenities={form.highlightCustomAmenities}
          bedrooms={form.bedrooms}
          fullBathrooms={form.fullBathrooms}
          halfBathrooms={form.halfBathrooms}
          onAmenitiesChange={(amenities) =>
            setForm((prev) => ({
              ...prev,
              amenities,
              highlightAmenities: prev.highlightAmenities.filter((id) => amenities.includes(id)),
            }))
          }
          onHighlightAmenitiesChange={(highlightAmenities) =>
            setForm((prev) => ({ ...prev, highlightAmenities }))
          }
          onCustomAmenityIdsChange={(customAmenityIds) =>
            setForm((prev) => ({
              ...prev,
              customAmenityIds,
              highlightCustomAmenities: prev.highlightCustomAmenities.filter((id) =>
                customAmenityIds.includes(id),
              ),
            }))
          }
          onHighlightCustomAmenitiesChange={(highlightCustomAmenities) =>
            setForm((prev) => ({ ...prev, highlightCustomAmenities }))
          }
        />
      </section>

      <section className="dashboard-panel space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-valle-forest-900">Incluye</h2>
          <p className="mt-1 text-sm text-valle-forest-600">
            Bullets que aparecen en la sección Incluye del modal de información completa.
          </p>
        </div>
        <PropertyIncludesEditor
          includes={form.includes}
          onChange={(includes) => setForm((prev) => ({ ...prev, includes }))}
        />
      </section>

      <section className="dashboard-panel space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-valle-forest-900">Imágenes</h2>
          <p className="mt-1 text-sm text-valle-forest-600">
            Portada y galería del modal Quick Look. Ordena con las flechas.
          </p>
        </div>
        <ImageGalleryEditor images={form.images} onChange={(images) => setForm({ ...form, images })} />
      </section>
      </form>

      <PropertyFormFloatingBar mode={mode} onPreview={() => setPreviewOpen(true)} />
      <PropertyPreviewModal
        product={previewProduct}
        status={form.status}
        featured={form.featured}
        isOpen={previewOpen}
        issues={previewIssues}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  )
}
