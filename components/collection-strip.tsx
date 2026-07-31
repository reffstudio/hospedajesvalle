"use client"

import { useRef, useState, useEffect, useCallback, type PointerEvent as ReactPointerEvent } from "react"
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
} from "@/lib/discover-valley"
import { cn } from "@/lib/utils"

const DEFAULT_SLOT_HEIGHT = 112
const ease = [0.21, 0.47, 0.32, 0.98] as const
const MENU_DRAG_THRESHOLD_PX = 8
const AUTO_SCROLL_INTERVAL_MS = 2000
const AUTO_SCROLL_PAUSE_MS = 9000

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
  const [sectionEngaged, setSectionEngaged] = useState(false)
  const [layout, setLayout] = useState<GalleryLayout>({
    slotHeight: DEFAULT_SLOT_HEIGHT,
    menuHeight: DEFAULT_SLOT_HEIGHT * 3,
  })
  const menuY = useMotionValue(menuOffsetForIndex(0, DEFAULT_SLOT_HEIGHT))
  const lastScrollProgress = useRef(0)
  const activeIndexRef = useRef(activeIndex)
  const menuPointerId = useRef<number | null>(null)
  const menuPointerStart = useRef({ y: 0, scrollTop: 0 })
  const menuPointerDragged = useRef(false)
  const suppressMenuClick = useRef(false)
  const autoScrollPausedUntil = useRef(0)
  const isAutoAdvancing = useRef(false)
  const lastAutoAdvanceAt = useRef(0)
  const prefersReducedMotion = useRef(false)
  activeIndexRef.current = activeIndex

  const pauseAutoScroll = useCallback((durationMs = AUTO_SCROLL_PAUSE_MS) => {
    autoScrollPausedUntil.current = Date.now() + durationMs
  }, [])

  const { slotHeight, menuHeight } = layout

  const getViewportHeight = useCallback(() => {
    if (typeof window !== "undefined") {
      return window.innerHeight
    }
    return stickyRef.current?.clientHeight ?? 0
  }, [])

  const items = discoverValleyGallery.map((item) => ({
    ...item,
    copy: t.discoverValley.cards[item.id as keyof typeof t.discoverValley.cards],
  }))

  const clampIndex = useCallback(
    (index: number) => Math.min(itemCount - 1, Math.max(0, index)),
    [itemCount],
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
    (
      index: number,
      syncScroll = true,
      scrollBehavior: ScrollBehavior = "smooth",
      options?: { fromAuto?: boolean },
    ) => {
      const next = clampIndex(index)
      if (!options?.fromAuto) {
        pauseAutoScroll()
      }
      activeIndexRef.current = next
      setActiveIndex(next)
      snapMenuToIndex(next)
      if (syncScroll) {
        scrollSectionToIndex(next, scrollBehavior)
        if (itemCount > 1) {
          lastScrollProgress.current = next / (itemCount - 1)
        }
      }
    },
    [clampIndex, itemCount, pauseAutoScroll, snapMenuToIndex, scrollSectionToIndex],
  )

  const handleMenuPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.pointerType !== "mouse") return

    pauseAutoScroll()

    menuPointerId.current = event.pointerId
    menuPointerDragged.current = false
    suppressMenuClick.current = false
    menuPointerStart.current = {
      y: event.clientY,
      scrollTop: window.scrollY,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [pauseAutoScroll])

  const handleMenuPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (menuPointerId.current !== event.pointerId) return

    const deltaY = menuPointerStart.current.y - event.clientY
    if (!menuPointerDragged.current && Math.abs(deltaY) < MENU_DRAG_THRESHOLD_PX) return

    menuPointerDragged.current = true
    suppressMenuClick.current = true
    pauseAutoScroll()
    event.preventDefault()

    window.scrollTo({
      top: menuPointerStart.current.scrollTop + deltaY,
      behavior: "auto",
    })
  }, [pauseAutoScroll])

  const endMenuPointer = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (menuPointerId.current !== event.pointerId) return

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    menuPointerId.current = null
    menuPointerDragged.current = false
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  useEffect(() => {
    lastScrollProgress.current = scrollYProgress.get()
  }, [scrollYProgress])

  const indicatorY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const remainingCount = itemCount - 1 - activeIndex

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (itemCount <= 1) return

    const previousProgress = lastScrollProgress.current
    lastScrollProgress.current = progress

    setActiveIndex((prev) => {
      const next = indexFromGalleryProgress(progress, itemCount, prev, previousProgress)
      if (prev !== next) {
        activeIndexRef.current = next
        animate(menuY, menuOffsetForIndex(next, slotHeight), { duration: 0.35, ease })
      }
      return next
    })
  })

  useEffect(() => {
    menuY.set(menuOffsetForIndex(activeIndexRef.current, slotHeight))
  }, [menuY, slotHeight])

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion.current = event.matches
    }
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    const sticky = stickyRef.current
    if (!sticky) return

    const observer = new IntersectionObserver(
      ([entry]) => setSectionEngaged(entry.isIntersecting && entry.intersectionRatio >= 0.85),
      { threshold: [0, 0.85, 1] },
    )
    observer.observe(sticky)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!sectionEngaged || itemCount <= 1 || prefersReducedMotion.current) return

    const tick = () => {
      if (Date.now() < autoScrollPausedUntil.current) return
      if (document.hidden) return
      if (menuPointerId.current !== null) return

      const next = (activeIndexRef.current + 1) % itemCount
      isAutoAdvancing.current = true
      lastAutoAdvanceAt.current = Date.now()
      goToIndex(next, true, "smooth", { fromAuto: true })

      window.setTimeout(() => {
        isAutoAdvancing.current = false
      }, 2500)
    }

    const intervalId = window.setInterval(tick, AUTO_SCROLL_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [goToIndex, itemCount, sectionEngaged])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const onWheel = () => {
      if (isAutoAdvancing.current || Date.now() - lastAutoAdvanceAt.current < 2500) return
      pauseAutoScroll()
    }

    section.addEventListener("wheel", onWheel, { passive: true })
    section.addEventListener("touchstart", pauseAutoScroll, { passive: true })
    return () => {
      section.removeEventListener("wheel", onWheel)
      section.removeEventListener("touchstart", pauseAutoScroll)
    }
  }, [pauseAutoScroll])

  useEffect(() => {
    let lastScrollY = window.scrollY

    const onScroll = () => {
      const gracePeriodActive =
        isAutoAdvancing.current || Date.now() - lastAutoAdvanceAt.current < 2500

      if (gracePeriodActive) {
        lastScrollY = window.scrollY
        return
      }
      if (!sectionEngaged) {
        lastScrollY = window.scrollY
        return
      }
      if (Math.abs(window.scrollY - lastScrollY) > 1) {
        pauseAutoScroll()
      }
      lastScrollY = window.scrollY
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [pauseAutoScroll, sectionEngaged])

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
          className="relative z-20 flex min-h-0 flex-1 items-center justify-center px-6 sm:px-10 touch-pan-y"
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
              className="cursor-grab touch-pan-y active:cursor-grabbing"
              style={{ y: menuY }}
              onPointerDown={handleMenuPointerDown}
              onPointerMove={handleMenuPointerMove}
              onPointerUp={endMenuPointer}
              onPointerCancel={endMenuPointer}
            >
              {items.map((item, index) => {
                const isActive = index === activeIndex
                const distance = Math.abs(index - activeIndex)

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (suppressMenuClick.current) {
                        suppressMenuClick.current = false
                        return
                      }
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
