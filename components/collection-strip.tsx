"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import {
  motion,
  useScroll,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  animate,
} from "framer-motion"
import Image from "next/image"
import { ChevronUp, ChevronDown } from "lucide-react"
import { useLanguage } from "./language-provider"
import { useCtaInNav } from "./hero-scroll-context"
import {
  discoverValleyGallery,
  indexFromGalleryProgress,
  scrollToProperties,
  scrollTopForGalleryIndex,
  menuOffsetForIndex,
  menuDragConstraints,
} from "@/lib/discover-valley"
import { cn } from "@/lib/utils"

const DEFAULT_SLOT_HEIGHT = 112
const ease = [0.21, 0.47, 0.32, 0.98] as const

type GalleryLayout = {
  slotHeight: number
  menuHeight: number
}

export function CollectionStrip() {
  const { t, tf } = useLanguage()
  const ctaInNav = useCtaInNav()
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const menuAreaRef = useRef<HTMLDivElement>(null)
  const itemCount = discoverValleyGallery.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPinned, setIsPinned] = useState(false)
  const [layout, setLayout] = useState<GalleryLayout>({
    slotHeight: DEFAULT_SLOT_HEIGHT,
    menuHeight: DEFAULT_SLOT_HEIGHT * 3,
  })
  const menuY = useMotionValue(menuOffsetForIndex(0, DEFAULT_SLOT_HEIGHT))
  const isDragging = useRef(false)
  const isWheelNavigating = useRef(false)
  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex

  const { slotHeight, menuHeight } = layout
  const dragLimits = menuDragConstraints(itemCount, slotHeight)

  const getViewportHeight = useCallback(() => {
    return stickyRef.current?.clientHeight ?? window.innerHeight
  }, [])

  const items = discoverValleyGallery.map((item) => ({
    ...item,
    copy: t.discoverValley.cards[item.id as keyof typeof t.discoverValley.cards],
  }))

  const clampIndex = useCallback(
    (index: number) => Math.min(itemCount - 1, Math.max(0, index)),
    [itemCount],
  )

  const indexFromMenuY = useCallback(
    (y: number) => clampIndex(Math.round(1 - y / slotHeight)),
    [clampIndex, slotHeight],
  )

  const snapMenuToIndex = useCallback(
    (index: number) => {
      animate(menuY, menuOffsetForIndex(index, slotHeight), { duration: 0.45, ease })
    },
    [menuY, slotHeight],
  )

  const scrollSectionToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const section = sectionRef.current
      if (!section || itemCount <= 1) return

      const top = scrollTopForGalleryIndex(section, index, itemCount, getViewportHeight())
      window.scrollTo({ top, behavior })
    },
    [getViewportHeight, itemCount],
  )

  const goToIndex = useCallback(
    (index: number, syncScroll = true, scrollBehavior: ScrollBehavior = "smooth") => {
      const next = clampIndex(index)
      setActiveIndex(next)
      snapMenuToIndex(next)
      if (syncScroll && !isDragging.current) {
        scrollSectionToIndex(next, scrollBehavior)
      }
    },
    [clampIndex, snapMenuToIndex, scrollSectionToIndex],
  )

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  const indicatorY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const remainingCount = itemCount - 1 - activeIndex

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (isDragging.current || isWheelNavigating.current || itemCount <= 1) return

    setActiveIndex((prev) => {
      const next = indexFromGalleryProgress(progress, itemCount)
      if (prev !== next) {
        animate(menuY, menuOffsetForIndex(next, slotHeight), { duration: 0.35, ease })
      }
      return next
    })
  })

  useEffect(() => {
    menuY.set(menuOffsetForIndex(activeIndex, slotHeight))
  }, [activeIndex, menuY, slotHeight])

  useEffect(() => {
    const sticky = stickyRef.current
    const header = headerRef.current
    const footer = footerRef.current
    const menuArea = menuAreaRef.current
    if (!sticky || !menuArea) return

    const measure = () => {
      const availableMenuHeight = menuArea.clientHeight
      const nextSlotHeight = Math.max(
        72,
        Math.min(128, Math.floor(availableMenuHeight / 3)),
      )
      setLayout({
        slotHeight: nextSlotHeight,
        menuHeight: nextSlotHeight * 3,
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(sticky)
    if (header) observer.observe(header)
    if (footer) observer.observe(footer)
    observer.observe(menuArea)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [ctaInNav])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsPinned(entry.isIntersecting && entry.intersectionRatio > 0.45),
      { threshold: [0, 0.45, 0.75, 1] },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const sticky = stickyRef.current
    if (!sticky) return

    const onWheel = (e: WheelEvent) => {
      if (!isPinned || itemCount <= 1) return

      const current = activeIndexRef.current
      const goingDown = e.deltaY > 0
      const goingUp = e.deltaY < 0

      // At section edges, allow native scroll so the page can continue up/down
      if (goingUp && current === 0) return
      if (goingDown && current === itemCount - 1) return

      e.preventDefault()

      const next = clampIndex(current + (goingDown ? 1 : -1))
      if (next === current) return

      isWheelNavigating.current = true
      setActiveIndex(next)
      snapMenuToIndex(next)
      scrollSectionToIndex(next, "auto")

      window.setTimeout(() => {
        isWheelNavigating.current = false
      }, 120)
    }

    sticky.addEventListener("wheel", onWheel, { passive: false })
    return () => sticky.removeEventListener("wheel", onWheel)
  }, [clampIndex, isPinned, itemCount, scrollSectionToIndex, snapMenuToIndex])

  return (
    <section
      ref={sectionRef}
      id="descubre-el-valle"
      className="relative"
      style={{ height: `${itemCount * 100}dvh` }}
    >
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden pt-[var(--site-header-height)]"
      >
        {/* Background — all images stay mounted so they preload and crossfade reliably */}
        <div className="absolute inset-0">
          {items.map((item, index) => {
            const isActive = index === activeIndex
            return (
              <motion.div
                key={item.id}
                className="absolute inset-0"
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  scale: isActive ? 1 : 1.05,
                }}
                transition={{ duration: 0.8, ease }}
                style={{ zIndex: isActive ? 2 : 1 }}
                aria-hidden={!isActive}
              >
                <Image
                  src={item.image}
                  alt={item.copy.title}
                  fill
                  className="object-cover object-center"
                  priority={index < 2}
                  sizes="100vw"
                />
              </motion.div>
            )
          })}
          <div className="absolute inset-0 z-[3] bg-black/60" aria-hidden />
        </div>

        {/* Header — in document flow so it stays visible below the navbar */}
        <div
          ref={headerRef}
          className="pointer-events-none relative z-20 shrink-0 px-6 pb-3 pt-2 text-center sm:pb-4"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
            Valle de Guadalupe
          </p>
          <h2 className="mt-1.5 text-lg font-light text-white/90 sm:text-xl lg:text-2xl">
            {t.discoverValley.title}
          </h2>
        </div>

        {/* Vertical menu — fills remaining viewport height */}
        <div
          ref={menuAreaRef}
          className="relative z-20 flex min-h-0 flex-1 items-center justify-center px-6 sm:px-10"
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden"
            style={{
              height: menuHeight,
              maskImage: "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%)",
            }}
          >
            <motion.div
              className="cursor-grab active:cursor-grabbing"
              style={{ y: menuY }}
              drag="y"
              dragConstraints={dragLimits}
              dragElastic={0.06}
              onDragStart={() => {
                isDragging.current = true
              }}
              onDragEnd={(_, info) => {
                isDragging.current = false
                const projected = menuY.get() + info.velocity.y * 0.1
                const next = indexFromMenuY(projected)
                setActiveIndex(next)
                snapMenuToIndex(next)
                scrollSectionToIndex(next)
              }}
            >
              {items.map((item, index) => {
                const isActive = index === activeIndex
                const distance = Math.abs(index - activeIndex)

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        scrollToProperties(item.filterCategory)
                        return
                      }
                      goToIndex(index)
                    }}
                    className="flex w-full flex-col items-center justify-center px-4 text-center sm:px-6"
                    style={{ height: slotHeight }}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span
                      className={cn(
                        "uppercase transition-all duration-500",
                        isActive
                          ? "text-2xl font-bold tracking-[0.06em] text-white drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)] sm:text-3xl lg:text-4xl lg:tracking-[0.04em]"
                          : distance === 1
                            ? "text-sm font-medium tracking-[0.12em] text-white/40 sm:text-base"
                            : "text-xs font-medium tracking-[0.14em] text-white/20 sm:text-sm",
                      )}
                    >
                      {item.copy.title}
                    </span>
                    <motion.p
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        height: isActive ? "auto" : 0,
                        marginTop: isActive ? 8 : 0,
                      }}
                      transition={{ duration: 0.35, ease }}
                      className="max-w-md overflow-hidden text-xs leading-snug text-white/75 sm:text-sm sm:leading-relaxed"
                    >
                      {item.copy.description}
                    </motion.p>
                  </button>
                )
              })}
            </motion.div>
          </div>

          {/* Section progress — anchored to menu area */}
          <div
            className="absolute right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 sm:right-5 lg:right-8"
            aria-label={t.discoverValley.progressAria}
          >
            <span className="text-[10px] font-semibold tabular-nums tracking-wider text-white/55">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>

            <div className="relative h-28 w-6 sm:h-32">
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/20" aria-hidden />

              {items.map((item, index) => {
                const top = itemCount <= 1 ? 0 : (index / (itemCount - 1)) * 100
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goToIndex(index)}
                    aria-label={`${item.copy.title} (${index + 1}/${itemCount})`}
                    aria-current={index === activeIndex ? "step" : undefined}
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 p-2"
                    style={{ top: `${top}%` }}
                  >
                    <span
                      className={cn(
                        "block rounded-full transition-all duration-300",
                        index === activeIndex
                          ? "h-2 w-2 bg-white/90"
                          : "h-1 w-1 bg-white/35 hover:bg-white/55",
                      )}
                    />
                  </button>
                )
              })}

              <motion.div
                className="pointer-events-none absolute left-1/2 h-5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.45)]"
                style={{ top: indicatorY }}
                aria-hidden
              />
            </div>

            <span className="text-[10px] font-semibold tabular-nums tracking-wider text-white/55">
              {String(itemCount).padStart(2, "0")}
            </span>

            {remainingCount > 0 && (
              <p className="max-w-[5rem] text-center text-[9px] uppercase leading-tight tracking-[0.12em] text-white/35">
                {tf(t.discoverValley.progressRemaining, { count: remainingCount })}
              </p>
            )}
          </div>
        </div>

        {/* Navigation hints */}
        <div
          ref={footerRef}
          className="pointer-events-none relative z-20 flex shrink-0 flex-col items-center gap-1.5 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1 text-white/40"
        >
          <ChevronUp size={16} className={cn("transition-opacity sm:h-[18px] sm:w-[18px]", activeIndex === 0 && "opacity-15")} />
          <p className="text-[9px] uppercase tracking-[0.22em] sm:text-[10px]">{t.discoverValley.dragHint}</p>
          <ChevronDown
            size={16}
            className={cn("transition-opacity sm:h-[18px] sm:w-[18px]", activeIndex === itemCount - 1 && "opacity-15")}
          />
        </div>
      </div>
    </section>
  )
}
