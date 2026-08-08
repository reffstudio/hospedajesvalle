"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Reveal } from "./reveal"
import { QuickLookModal } from "./quick-look-modal"
import { useLanguage } from "./language-provider"
import { pickDisplayReviews, type DisplayReview } from "@/lib/reviews"
import { usePublishedProperties } from "@/lib/properties/use-published-properties"
import type { PublicProperty } from "@/lib/properties/types"
import { cn } from "@/lib/utils"

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? "fill-valle-gold-500 text-valle-gold-500" : "text-valle-sage-300"}
        />
      ))}
    </div>
  )
}

function ReviewPropertyButton({
  review,
  onOpen,
  compact = false,
}: {
  review: DisplayReview
  onOpen: (product: PublicProperty) => void
  compact?: boolean
}) {
  const { t, tf } = useLanguage()

  return (
    <button
      type="button"
      onClick={() => onOpen(review.product)}
      aria-label={tf(t.carousel.viewDetails, { name: review.property })}
      className={cn(
        "mt-1.5 flex w-full min-w-0 items-center gap-2 rounded-lg border border-valle-sage-100 bg-valle-sage-50/60 p-1 pr-2.5 text-left transition-colors hover:border-valle-sage-200 hover:bg-valle-sage-50 active:scale-[0.99]",
        compact && "mt-1",
      )}
    >
      <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-valle-sage-200 ring-1 ring-black/5">
        <Image src={review.product.image} alt="" fill className="object-cover" sizes="32px" />
      </span>
      <span className="min-w-0 truncate text-[11px] font-medium text-valle-wine-600">{review.property}</span>
    </button>
  )
}

function ReviewCardContent({
  review,
  onOpenProperty,
  compact = false,
}: {
  review: DisplayReview
  onOpenProperty: (product: PublicProperty) => void
  compact?: boolean
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <StarRating rating={review.rating} size={compact ? 11 : 12} />
        <span className="shrink-0 text-[10px] tabular-nums text-neutral-400">{review.date}</span>
      </div>

      <blockquote
        className={cn(
          "mt-2.5 text-neutral-700",
          compact
            ? "line-clamp-3 text-[13px] leading-snug"
            : "line-clamp-4 text-sm leading-relaxed lg:line-clamp-none lg:text-[15px]",
        )}
      >
        &ldquo;{review.quote}&rdquo;
      </blockquote>

      <footer className={cn("mt-3 border-t border-valle-sage-100 pt-3", compact && "mt-2.5 pt-2.5")}>
        <p className="truncate text-[13px] font-semibold text-valle-forest-900">{review.name}</p>
        <p className="truncate text-[11px] text-neutral-500">{review.origin}</p>
        <ReviewPropertyButton review={review} onOpen={onOpenProperty} compact={compact} />
      </footer>
    </>
  )
}

function ReviewCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-valle-sage-200 bg-white",
        compact ? "h-[168px] w-[82vw] shrink-0 snap-center p-3.5" : "p-4 lg:p-5",
      )}
      aria-hidden
    >
      <div className="flex justify-between">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-2.5 w-2.5 rounded-full bg-valle-sage-100" />
          ))}
        </div>
        <div className="h-2.5 w-14 rounded bg-valle-sage-100" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-2.5 w-full rounded bg-valle-sage-100" />
        <div className="h-2.5 w-[90%] rounded bg-valle-sage-100" />
        <div className="h-2.5 w-[70%] rounded bg-valle-sage-100" />
      </div>
      <div className="mt-auto space-y-1.5 border-t border-valle-sage-100 pt-3">
        <div className="h-3 w-28 rounded bg-valle-sage-100" />
        <div className="h-2.5 w-20 rounded bg-valle-sage-100" />
        <div className="mt-1 flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-valle-sage-100" />
          <div className="h-2.5 w-24 rounded bg-valle-sage-100" />
        </div>
      </div>
    </div>
  )
}

function ReviewCardDesktop({
  review,
  index,
  onOpenProperty,
}: {
  review: DisplayReview
  index: number
  onOpenProperty: (product: PublicProperty) => void
}) {
  return (
    <Reveal delay={0.04 * index}>
      <motion.article
        className="flex h-full flex-col rounded-xl border border-valle-sage-200/90 bg-white p-4 shadow-[0_4px_24px_rgba(24,40,32,0.05)] lg:p-5"
        whileHover={{ y: -3 }}
        transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <ReviewCardContent review={review} onOpenProperty={onOpenProperty} />
      </motion.article>
    </Reveal>
  )
}

function ReviewsMobileCarousel({
  reviews,
  onOpenProperty,
}: {
  reviews: DisplayReview[]
  onOpenProperty: (product: PublicProperty) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const items = el.querySelectorAll<HTMLElement>("[data-review-item]")
    if (items.length === 0) return
    if (items.length === 1) {
      setActiveIndex(0)
      return
    }
    const step = items[1].offsetLeft - items[0].offsetLeft
    if (step <= 0) return
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
      setActiveIndex(items.length - 1)
      return
    }
    setActiveIndex(Math.min(items.length - 1, Math.max(0, Math.round(el.scrollLeft / step))))
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [handleScroll, reviews])

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    const items = el.querySelectorAll<HTMLElement>("[data-review-item]")
    const item = items[index]
    if (!item) return
    el.scrollTo({ left: item.offsetLeft - (el.clientWidth - item.offsetWidth) / 2, behavior: "smooth" })
    setActiveIndex(index)
  }

  return (
    <div className="md:hidden">
      <div
        ref={scrollRef}
        className="-mx-4 flex gap-3 overflow-x-auto scroll-smooth px-4 pb-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review) => (
          <article
            key={review.id}
            data-review-item
            className="w-[82vw] max-w-[320px] shrink-0 snap-center rounded-xl border border-valle-sage-200/90 bg-white p-3.5 shadow-[0_4px_20px_rgba(24,40,32,0.06)]"
          >
            <ReviewCardContent review={review} onOpenProperty={onOpenProperty} compact />
          </article>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          {reviews.map((review, i) => (
            <button
              key={review.id}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Review ${i + 1}`}
              aria-current={i === activeIndex}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIndex ? "w-5 bg-valle-forest-800" : "w-1.5 bg-valle-sage-300",
              )}
            />
          ))}
        </div>
        <span className="text-[11px] tabular-nums text-neutral-400">
          {activeIndex + 1}/{reviews.length}
        </span>
      </div>
    </div>
  )
}

export function ReviewsSection() {
  const { locale, t } = useLanguage()
  const { properties } = usePublishedProperties(locale)
  const [reviews, setReviews] = useState<DisplayReview[] | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<PublicProperty | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setReviews(pickDisplayReviews(locale, { properties }))
    setSelectedProduct(null)
    setIsModalOpen(false)
  }, [locale, properties])

  const handleOpenProperty = (product: PublicProperty) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <>
      <section className="bg-valle-cream-50 py-12 md:py-16 lg:py-24" id="reviews">
        <div className="container-custom">
          <Reveal>
            <div className="mb-6 md:mb-8 lg:mb-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
                <div className="max-w-xl text-left">
                  <h2 className="text-3xl font-normal tracking-tight text-valle-forest-900 md:text-4xl lg:text-5xl">
                    {t.reviews.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 md:text-base">{t.reviews.subtitle}</p>
                </div>

                <div className="inline-flex w-fit items-center gap-4 rounded-full border border-valle-sage-200/90 bg-white px-4 py-2.5 shadow-[0_2px_12px_rgba(24,40,32,0.04)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tabular-nums text-valle-wine-600">{t.reviews.average}</span>
                    <StarRating rating={5} size={11} />
                  </div>
                  <span className="h-4 w-px bg-valle-sage-200" aria-hidden />
                  <div>
                    <p className="text-sm font-bold tabular-nums text-valle-forest-900">{t.reviews.total}</p>
                    <p className="text-[10px] text-neutral-500">{t.reviews.totalLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {reviews ? (
            <>
              <ReviewsMobileCarousel reviews={reviews} onOpenProperty={handleOpenProperty} />
              <div className="hidden md:grid md:grid-cols-2 md:gap-4 lg:gap-5">
                {reviews.map((review, index) => (
                  <ReviewCardDesktop
                    key={review.id}
                    review={review}
                    index={index}
                    onOpenProperty={handleOpenProperty}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-3 overflow-hidden md:hidden">
                {Array.from({ length: 4 }, (_, index) => (
                  <ReviewCardSkeleton key={`sk-m-${index}`} compact />
                ))}
              </div>
              <div className="hidden md:grid md:grid-cols-2 md:gap-4">
                {Array.from({ length: 4 }, (_, index) => (
                  <ReviewCardSkeleton key={`sk-d-${index}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <QuickLookModal product={selectedProduct} isOpen={isModalOpen} onClose={closeModal} />
    </>
  )
}
