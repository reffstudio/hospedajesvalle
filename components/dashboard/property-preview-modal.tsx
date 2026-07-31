"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { LanguageProvider } from "@/components/language-provider"
import { AmenityIconList } from "@/components/amenity-icon-list"
import { getAmenityLabel } from "@/lib/amenity-catalog"
import type { AmenityId } from "@/lib/property-amenities"
import type { PropertyStatus } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

type PropertyPreviewModalProps = {
  product: PropertyPreviewProduct
  status: PropertyStatus
  featured: boolean
  isOpen: boolean
  issues: string[]
  onClose: () => void
}

function VisibilityNote({
  visible,
  visibleLabel,
  hiddenLabel,
}: {
  visible: boolean
  visibleLabel: string
  hiddenLabel: string
}) {
  return (
    <p
      className={cn(
        "rounded-lg px-3 py-2 text-xs font-medium",
        visible
          ? "bg-valle-olive-50 text-valle-forest-800"
          : "bg-valle-wine-50 text-valle-wine-800",
      )}
    >
      {visible ? visibleLabel : hiddenLabel}
    </p>
  )
}

function PropertiesPagePreviewPanel({ product }: { product: PropertyPreviewProduct }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-valle-sage-200 bg-valle-sage-50">
      <div className="border-b border-valle-sage-200 bg-white px-4 py-5 text-center sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-valle-forest-500">
          /propiedades
        </p>
        <h3 className="mt-2 text-xl font-bold text-valle-forest-900 sm:text-2xl">Todas las propiedades</h3>
        <p className="mt-2 text-sm text-valle-forest-600">
          Explora nuestro catálogo completo en Valle de Guadalupe.
        </p>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <p className="mb-3 text-sm font-medium text-valle-forest-700">Filtrar por amenidades</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {product.amenities.slice(0, 4).map((id) => (
            <span
              key={id}
              className="rounded-full border border-valle-sage-300 bg-white px-3 py-1.5 text-xs font-medium text-valle-forest-700"
            >
              {getAmenityLabel(id as AmenityId, "es")}
            </span>
          ))}
        </div>

        <div className="mx-auto max-w-sm">
          <LanguageProvider>
            <ProductCard product={product} onQuickLook={() => {}} />
          </LanguageProvider>
        </div>
      </div>
    </div>
  )
}

function QuickLookPreviewPanel({ product }: { product: PropertyPreviewProduct }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    setCurrentImageIndex(0)
  }, [product.id, product.quickLookImages])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.quickLookImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + product.quickLookImages.length) % product.quickLookImages.length,
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="relative">
        <div className="relative mb-4 aspect-square overflow-hidden rounded-lg">
          <Image
            src={product.quickLookImages[currentImageIndex]}
            alt={`${product.name} - imagen ${currentImageIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {product.quickLookImages.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight size={20} />
              </button>
            </>
          ) : null}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {product.quickLookImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                currentImageIndex === index ? "border-valle-forest-900" : "border-valle-sage-200",
              )}
              onClick={() => setCurrentImageIndex(index)}
            >
              <Image
                src={image}
                alt={`${product.name} miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="mb-6 pr-4">
          <h2 className="mb-2 text-3xl font-bold text-valle-forest-900">{product.name}</h2>
          <p className="text-lg text-neutral-600">
            {product.materials.length > 0 ? product.materials.join(", ") : "Highlights de la tarjeta"}
          </p>
        </div>

        <div className="flex-1 space-y-6">
          <div className="text-2xl font-bold text-valle-forest-900">{product.price}</div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-valle-forest-900">Capacidad</h4>
            <p className="text-neutral-600">{product.dimensions}</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-valle-forest-900">Amenidades</h4>
            <AmenityIconList
              items={product.amenityItems}
              emptyLabel="Selecciona amenidades para verlas aquí."
            />
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-valle-forest-900">Incluye</h4>
            {product.includes.length > 0 ? (
              <ul className="space-y-2 text-sm text-neutral-600">
                {product.includes.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-valle-forest-500">Agrega bullets en la sección Incluye.</p>
            )}
          </div>
        </div>

        <div className="mt-6 w-full rounded-full bg-valle-sage-200 py-4 text-center text-sm font-medium text-valle-forest-600">
          Pre-reservar (solo vista previa)
        </div>
      </div>
    </div>
  )
}

export function PropertyPreviewModal({
  product,
  status,
  featured,
  isOpen,
  issues,
  onClose,
}: PropertyPreviewModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-valle-sage-200 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-valle-forest-500">
                  Vista previa
                </p>
                <h2 className="mt-1 text-xl font-semibold text-valle-forest-900">Cómo se verá en el sitio</h2>
              </div>
              <button
                type="button"
                className="dashboard-icon-btn shrink-0"
                onClick={onClose}
                aria-label="Cerrar vista previa"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {issues.length > 0 ? (
              <div className="border-b border-valle-wine-100 bg-valle-wine-50 px-5 py-3 sm:px-6">
                <ul className="space-y-1 text-sm text-valle-wine-800">
                  {issues.map((issue) => (
                    <li key={issue}>• {issue}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="overflow-y-auto overscroll-contain px-5 py-6 sm:px-6">
              <div className="space-y-10">
                <section className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-valle-forest-700">
                      Home · Carrusel destacado
                    </p>
                    <p className="mt-1 text-sm text-valle-forest-600">
                      Solo si la propiedad está publicada y marcada como destacada.
                    </p>
                  </div>
                  <VisibilityNote
                    visible={status === "published" && featured}
                    visibleLabel="Visible en el carrusel del home."
                    hiddenLabel={
                      status !== "published"
                        ? "No aparece: la propiedad no está publicada."
                        : "No aparece: no está marcada como destacada."
                    }
                  />
                  <div className="mx-auto max-w-sm">
                    <LanguageProvider>
                      <ProductCard product={product} onQuickLook={() => {}} priority />
                    </LanguageProvider>
                  </div>
                </section>

                <section className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-valle-forest-700">
                      Catálogo · /propiedades
                    </p>
                    <p className="mt-1 text-sm text-valle-forest-600">
                      Tarjeta dentro del listado completo con filtros por amenidades.
                    </p>
                  </div>
                  <VisibilityNote
                    visible={status === "published"}
                    visibleLabel="Visible en el catálogo público."
                    hiddenLabel="No aparece: solo las propiedades publicadas se muestran en /propiedades."
                  />
                  <PropertiesPagePreviewPanel product={product} />
                </section>

                <section className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-valle-forest-700">
                      Quick Look · Modal de detalle
                    </p>
                    <p className="mt-1 text-sm text-valle-forest-600">
                      Se abre al hacer clic en la tarjeta (home o catálogo).
                    </p>
                  </div>
                  <div className="rounded-2xl border border-valle-sage-200 bg-valle-sage-50/40 p-4 sm:p-5">
                    <QuickLookPreviewPanel product={product} />
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
