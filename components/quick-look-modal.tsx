"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { AmenityIconList } from "@/components/amenity-icon-list"
import { BlurPanel } from "./blur-panel"
import { usePreReservation } from "./pre-reservation-context"
import { useLanguage } from "./language-provider"
import { prefetchPublicProperties } from "@/lib/properties/use-published-properties"
import { productAmenitiesToListItems } from "@/lib/amenity-list"
import { hydratePublicPropertyAmenities } from "@/lib/properties/hydrate-public-property"

interface QuickLookModalProps {
  product: any
  isOpen: boolean
  onClose: () => void
}

export function QuickLookModal({ product, isOpen, onClose }: QuickLookModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { open: openPreReservation } = usePreReservation()
  const { locale, t } = useLanguage()

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
    setCurrentImageIndex((prev) => (prev - 1 + hydratedProduct.quickLookImages.length) % hydratedProduct.quickLookImages.length)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <BlurPanel className="bg-white/95 backdrop-blur-md">
              <button
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full transition-colors duration-200 shadow-sm"
                onClick={onClose}
                aria-label={t.common.close}
              >
                <X size={22} />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                <div className="relative">
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                    <Image
                      src={hydratedProduct.quickLookImages[currentImageIndex]}
                      alt={`${hydratedProduct.name} - Image ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />

                    {hydratedProduct.quickLookImages.length > 1 && (
                      <>
                        <button
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200"
                          onClick={prevImage}
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200"
                          onClick={nextImage}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {hydratedProduct.quickLookImages.map((image: string, index: number) => (
                      <button
                        key={index}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          currentImageIndex === index ? "border-valle-forest-900" : "border-valle-sage-200"
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <Image
                          src={image}
                          alt={`${hydratedProduct.name} thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="mb-6 pr-10">
                    <h2 className="text-3xl font-bold text-valle-forest-900 mb-2">{hydratedProduct.name}</h2>
                    <p className="text-lg text-neutral-600">{hydratedProduct.materials.join(", ")}</p>
                  </div>

                  <div className="space-y-6 flex-1">
                    <div className="text-2xl font-bold text-valle-forest-900">{hydratedProduct.price}</div>

                    <div>
                      <h4 className="text-sm font-medium text-valle-forest-900 mb-2">{t.quickLook.capacity}</h4>
                      <p className="text-neutral-600">{hydratedProduct.dimensions}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-valle-forest-900 mb-3">{t.quickLook.amenities}</h4>
                      <AmenityIconList
                        items={amenityItems}
                        emptyLabel={locale === "es" ? "Sin amenidades registradas." : "No amenities listed."}
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-valle-forest-900 mb-3">{t.quickLook.includes}</h4>
                      <ul className="space-y-2 text-sm text-neutral-600">
                        {includesList.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => {
                      prefetchPublicProperties(locale)
                      onClose()
                      window.setTimeout(() => openPreReservation(hydratedProduct.id), 260)
                    }}
                    className="w-full bg-valle-wine-600 text-white py-4 rounded-full font-medium text-lg hover:bg-valle-wine-700 transition-colors duration-200 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus size={20} />
                    {t.common.preReserve}
                  </motion.button>
                </div>
              </div>
            </BlurPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
