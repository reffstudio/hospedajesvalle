"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
          className="absolute left-2 lg:left-3 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-valle-forest-900 shadow-lg backdrop-blur transition-all hover:bg-white disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === properties.length - 1}
          aria-label={t.carousel.next}
          className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-valle-forest-900 shadow-lg backdrop-blur transition-all hover:bg-white disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Track */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-2 lg:px-14 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {properties.map((property) => (
            <div
              key={property.id}
              data-carousel-item
              className="snap-start shrink-0 w-[78vw] sm:w-[360px] lg:w-[380px]"
            >
              <ProductCard product={property} onQuickLook={onQuickLook} priority />
            </div>
          ))}
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
        <Link
          href="/propiedades"
          className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
        >
          {t.carousel.fullList}
        </Link>
      </div>
    </div>
  )
}
