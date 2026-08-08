"use client"

import { useEffect, useMemo, useState } from "react"
import { ProductCard } from "./product-card"
import { QuickLookModal } from "./quick-look-modal"
import { usePublishedProperties } from "@/lib/properties/use-published-properties"
import type { PublicProperty } from "@/lib/properties/types"
import { amenitiesForDiscoverFilter, isDiscoverFilterCategory } from "@/lib/properties/discover-filter"
import { PROPERTY_FILTER_SESSION_KEY } from "@/lib/data/storage-keys"
import { AMENITY_IDS, filterProductsByAmenities, type AmenityId } from "@/lib/property-amenities"
import {
  PROPERTY_STAY_TYPES,
  filterProductsByStayType,
  getStayTypeLabel,
  type PropertyStayType,
} from "@/lib/property-stay-type"
import { useLanguage } from "./language-provider"
import { cn } from "@/lib/utils"

export function PropertiesDirectory() {
  const { locale, t, tf } = useLanguage()
  const { properties: products } = usePublishedProperties(locale)
  const [selectedStayTypes, setSelectedStayTypes] = useState<PropertyStayType[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityId[]>([])
  const [selectedProduct, setSelectedProduct] = useState<PublicProperty | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const pendingFilter = sessionStorage.getItem(PROPERTY_FILTER_SESSION_KEY)
    if (!pendingFilter) return

    sessionStorage.removeItem(PROPERTY_FILTER_SESSION_KEY)
    if (isDiscoverFilterCategory(pendingFilter)) {
      setSelectedAmenities(amenitiesForDiscoverFilter(pendingFilter))
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const byStayType = filterProductsByStayType(products, selectedStayTypes)
    return filterProductsByAmenities(byStayType, selectedAmenities)
  }, [products, selectedStayTypes, selectedAmenities])

  const availableStayTypes = PROPERTY_STAY_TYPES.filter((stayType) =>
    products.some((product) => product.stayType === stayType),
  )

  const availableAmenities = AMENITY_IDS.filter((id) => products.some((product) => product.amenities.includes(id)))

  const hasActiveFilters = selectedStayTypes.length > 0 || selectedAmenities.length > 0

  const toggleStayType = (stayType: PropertyStayType) => {
    setSelectedStayTypes((current) =>
      current.includes(stayType) ? current.filter((item) => item !== stayType) : [...current, stayType],
    )
  }

  const toggleAmenity = (id: AmenityId) => {
    setSelectedAmenities((current) =>
      current.includes(id) ? current.filter((amenity) => amenity !== id) : [...current, id],
    )
  }

  const clearFilters = () => {
    setSelectedStayTypes([])
    setSelectedAmenities([])
  }

  const handleQuickLook = (product: PublicProperty) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <section className="bg-valle-sage-50 pb-16 pt-[calc(var(--site-header-height)+2rem)]">
      <div className="container-custom">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h1 className="text-balance text-3xl font-bold text-valle-forest-900 sm:text-4xl lg:text-5xl">
            {t.propertiesPage.title}
          </h1>
          <p className="mt-4 text-pretty text-lg text-valle-forest-600">{t.propertiesPage.subtitle}</p>
        </div>

        <div className="mb-8 space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-valle-forest-700">{t.propertiesPage.stayTypeFiltersLabel}</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-medium text-valle-wine-700 underline-offset-2 hover:underline"
                >
                  {t.propertiesPage.clearFilters}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {availableStayTypes.map((stayType) => {
                const label = getStayTypeLabel(stayType, t.propertyStayTypes)
                const isActive = selectedStayTypes.includes(stayType)
                return (
                  <button
                    key={stayType}
                    type="button"
                    onClick={() => toggleStayType(stayType)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "border-valle-wine-700 bg-valle-wine-700 text-white"
                        : "border-valle-sage-300 bg-white text-valle-forest-700 hover:border-valle-forest-400",
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-valle-forest-700">{t.propertiesPage.amenityFiltersLabel}</p>
            <div className="flex flex-wrap gap-2">
              {availableAmenities.map((id) => {
                const label = t.amenities[id]
                const isActive = selectedAmenities.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleAmenity(id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "border-valle-forest-800 bg-valle-forest-800 text-white"
                        : "border-valle-sage-300 bg-white text-valle-forest-700 hover:border-valle-forest-400",
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <p className="text-sm text-valle-forest-500">
            {tf(t.propertiesPage.showing, { count: filteredProducts.length })}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-valle-sage-300 bg-white px-6 py-16 text-center text-valle-forest-600">
            {t.propertiesPage.noResults}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickLook={() => handleQuickLook(product)}
                priority={index < 3}
              />
            ))}
          </div>
        )}
      </div>

      <QuickLookModal product={selectedProduct} isOpen={isModalOpen} onClose={closeModal} />
    </section>
  )
}
