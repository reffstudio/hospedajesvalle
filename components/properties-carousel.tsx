"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { ProductCard } from "./product-card"
import { cn } from "@/lib/utils"
import { useLanguage } from "./language-provider"

interface PropertiesCarouselProps {
  properties: any[]
  onQuickLook: (product: any) => void
}

export function PropertiesCarousel({ properties, onQuickLook }: PropertiesCarouselProps) {
  const { t, tf } = useLanguage()
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Distance between consecutive card starts (card width + gap).
  const getStep = () => {
    const el = scrollRef.current
    if (!el) return 0
    const items = el.querySelectorAll<HTMLElement>("[data-carousel-item]")
    if (items.length < 2) return items[0]?.offsetWidth ?? 0
    return items[1].offsetLeft - items[0].offsetLeft
  }

  // Derive the active card from the current scroll position (left-aligned steps).
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const step = getStep()
    if (step <= 0) return
    // If we've reached the end of the track, the last card is the active one.
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
      setActiveIndex(properties.length - 1)
      return
    }
    setActiveIndex(Math.min(properties.length - 1, Math.max(0, Math.round(el.scrollLeft / step))))
  }, [properties.length])

  useEffect(() => {
    properties.forEach((property) => {
      const img = new window.Image()
      img.src = property.image
    })
  }, [properties])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Chrome keeps vertical wheel on horizontal carousels instead of bubbling to the page.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      event.preventDefault()
      window.scrollBy({ top: event.deltaY, left: 0, behavior: "auto" })
    }

    root.addEventListener("wheel", onWheel, { passive: false })
    return () => root.removeEventListener("wheel", onWheel)
  }, [])

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    const clamped = Math.min(properties.length - 1, Math.max(0, index))
    el.scrollTo({ left: clamped * getStep(), behavior: "smooth" })
    setActiveIndex(clamped)
  }

  return (
    <div ref={rootRef} className="w-full">
      <div className="relative">
        {/* Arrows */}
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label={t.carousel.prev}
          className="absolute left-3 sm:left-4 md:left-[calc(var(--space-6)+0.25rem)] top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-valle-forest-900 shadow-lg backdrop-blur transition-all hover:bg-white disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === properties.length - 1}
          aria-label={t.carousel.next}
          className="absolute right-3 sm:right-4 md:right-[calc(var(--space-6)+0.25rem)] top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-valle-forest-900 shadow-lg backdrop-blur transition-all hover:bg-white disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Track */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-5 pb-2 sm:px-6 md:px-[var(--space-6)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {properties.map((property) => (
            <div
              key={property.id}
              data-carousel-item
              className="snap-start shrink-0 w-[72vw] sm:w-[360px] lg:w-[380px]"
            >
              <ProductCard product={property} onQuickLook={onQuickLook} priority />
            </div>
          ))}
          <div className="snap-start shrink-0 w-5 sm:w-6 md:w-[var(--space-6)]" aria-hidden />
        </div>
      </div>

      {/* Position marker */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          {properties.map((property, i) => (
            <button
              key={property.id}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={tf(t.carousel.goTo, { name: property.name })}
              aria-current={i === activeIndex}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === activeIndex ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70",
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-white/80 tabular-nums">
          {activeIndex + 1} / {properties.length}
        </span>
      </div>

      <div className="mt-6 flex justify-center">
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.25 }}>
          <Link
            href="/propiedades"
            className="view-all-properties-btn group inline-flex items-center gap-2.5 rounded-full px-7 py-3 text-sm font-semibold tracking-wide text-white"
          >
            <span className="view-all-properties-btn__sweep pointer-events-none absolute inset-0 rounded-full" aria-hidden />
            <span className="relative z-10">{t.carousel.fullList}</span>
            <ArrowRight
              className="relative z-10 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
