"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { AmenityIconList } from "@/components/amenity-icon-list"
import { usePreReservation } from "./pre-reservation-context"
import { useLanguage } from "./language-provider"
import { prefetchPublicProperties } from "@/lib/properties/use-published-properties"
import { prefetchPropertyImages } from "@/lib/properties/prefetch-property-images"
import { productAmenitiesToListItems } from "@/lib/amenity-list"
import { hydratePublicPropertyAmenities } from "@/lib/properties/hydrate-public-property"
import type { PublicProperty } from "@/lib/properties/types"

const panelEase = [0.22, 1, 0.36, 1] as const

interface QuickLookModalProps {
  product: PublicProperty | null
  isOpen: boolean
  onClose: () => void
}

export function QuickLookModal({ product, isOpen, onClose }: QuickLookModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const hasOpenedRef = useRef(false)
  const { open: openPreReservation } = usePreReservation()
  const { locale, t } = useLanguage()

  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setShowDetails(false)
      return
    }

    if (product) {
      prefetchPropertyImages([product])
    }

    const frame = window.requestAnimationFrame(() => {
      setShowDetails(true)
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [isOpen, product])

  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [isOpen])

  useEffect(() => {
    setCurrentImageIndex(0)
  }, [product?.id, isOpen])

  if (!product && !hasOpenedRef.current) return null
  if (!product) return null

  const hydratedProduct = hydratePublicPropertyAmenities(product, locale)

  const amenityItems =
    hydratedProduct.amenityItems.length > 0
      ? hydratedProduct.amenityItems
      : productAmenitiesToListItems(hydratedProduct.amenities, locale)
  const includesList =
    hydratedProduct.includes?.length > 0 ? hydratedProduct.includes : t.quickLook.includesList

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % hydratedProduct.quickLookImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + hydratedProduct.quickLookImages.length) % hydratedProduct.quickLookImages.length,
    )
  }

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-black/65" onClick={onClose} aria-hidden />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-2xl bg-white shadow-2xl will-change-transform"
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.24, ease: panelEase }}
          >
            <button
              className="absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2 shadow-sm transition-colors hover:bg-neutral-100"
              onClick={onClose}
              aria-label={t.common.close}
            >
              <X size={22} />
            </button>

            <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-2">
              <div className="relative">
                <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-valle-sage-100">
                  <Image
                    src={hydratedProduct.quickLookImages[currentImageIndex]}
                    alt={`${hydratedProduct.name} - Image ${currentImageIndex + 1}`}
                    fill
                    priority
                    loading="eager"
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />

                  {hydratedProduct.quickLookImages.length > 1 ? (
                    <>
                      <button
                        type="button"
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
                        onClick={prevImage}
                        aria-label={t.carousel.prev}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
                        onClick={nextImage}
                        aria-label={t.carousel.next}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  ) : null}
                </div>

                {showDetails && hydratedProduct.quickLookImages.length > 1 ? (
                  <div className="flex gap-2">
                    {hydratedProduct.quickLookImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
                          currentImageIndex === index ? "border-valle-forest-900" : "border-valle-sage-200"
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`${hydratedProduct.name} thumbnail ${index + 1}`}
                      >
                        <Image
                          src={image}
                          alt=""
                          fill
                          loading="eager"
                          className="object-cover"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col">
                <div className="mb-6 pr-10">
                  <h2 className="mb-2 text-3xl font-bold text-valle-forest-900">{hydratedProduct.name}</h2>
                  <p className="text-lg text-neutral-600">{hydratedProduct.materials.join(", ")}</p>
                </div>

                {showDetails ? (
                  <div className="flex-1 space-y-6">
                    <div className="text-2xl font-bold text-valle-forest-900">{hydratedProduct.price}</div>

                    <div>
                      <h4 className="mb-2 text-sm font-medium text-valle-forest-900">{t.quickLook.capacity}</h4>
                      <p className="text-neutral-600">{hydratedProduct.dimensions}</p>
                    </div>

                    <div>
                      <h4 className="mb-3 text-sm font-medium text-valle-forest-900">{t.quickLook.amenities}</h4>
                      <AmenityIconList
                        items={amenityItems}
                        emptyLabel={locale === "es" ? "Sin amenidades registradas." : "No amenities listed."}
                      />
                    </div>

                    <div>
                      <h4 className="mb-3 text-sm font-medium text-valle-forest-900">{t.quickLook.includes}</h4>
                      <ul className="space-y-2 text-sm text-neutral-600">
                        {includesList.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 space-y-4" aria-hidden>
                    <div className="h-8 w-32 animate-pulse rounded-lg bg-valle-sage-100" />
                    <div className="h-20 animate-pulse rounded-xl bg-valle-sage-100" />
                    <div className="h-36 animate-pulse rounded-xl bg-valle-sage-100" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    prefetchPublicProperties(locale)
                    onClose()
                    window.setTimeout(() => openPreReservation(hydratedProduct.id), 260)
                  }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-valle-wine-600 py-4 text-lg font-medium text-white transition-colors hover:bg-valle-wine-700"
                >
                  <Plus size={20} />
                  {t.common.preReserve}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
