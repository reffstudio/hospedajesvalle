"use client"

import { motion, useTransform, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect, useLayoutEffect } from "react"
import Image from "next/image"
import { MapPin, Home, ShieldCheck, ChevronDown } from "lucide-react"
import { Reveal } from "./reveal"
import { PropertiesCarousel } from "./properties-carousel"
import { QuickLookModal } from "./quick-look-modal"
import { getRoundedPropertyDisplayCount } from "@/lib/properties/queries"
import { useFeaturedCarouselProperties } from "@/lib/properties/use-published-properties"
import {
  HERO_SCROLL_RESET_EVENT,
} from "@/lib/hero-featured-scroll"
import { useHeroScrollProgress, useCtaInNav } from "./hero-scroll-context"
import { useLanguage } from "./language-provider"
import { PreReservarButton } from "./pre-reservar-button"
import { BrandLogo } from "./brand-logo"

function HeroChromeStatsRow() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const { t, tf } = useLanguage()
  const propertiesCountLabel = tf(t.hero.propertiesCount, {
    count: getRoundedPropertyDisplayCount(),
  })

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const row = rowRef.current
    if (!wrap || !row) return

    const fit = () => {
      setScale(1)
      requestAnimationFrame(() => {
        const available = wrap.clientWidth
        const needed = row.scrollWidth
        if (available <= 0 || needed <= 0) return
        setScale(needed > available ? Math.max(0.72, available / needed) : 1)
      })
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(wrap)
    observer.observe(row)
    window.addEventListener("resize", fit)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", fit)
    }
  }, [propertiesCountLabel, t.hero.certifiedHost, t.hero.location])

  const statClass =
    "flex shrink-0 items-center gap-[clamp(0.2rem,0.9vw,0.375rem)] whitespace-nowrap font-medium leading-none"

  return (
    <div ref={wrapRef} className="w-full overflow-hidden">
      <div
        ref={rowRef}
        className="hero-chrome-stats mx-auto flex w-max max-w-none items-center justify-center gap-x-[clamp(0.35rem,2vw,2rem)] text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]"
        style={scale < 1 ? { transform: `scale(${scale})`, transformOrigin: "center top" } : undefined}
      >
        <div className={statClass}>
          <MapPin className="h-[clamp(0.625rem,2.2vw,1rem)] w-[clamp(0.625rem,2.2vw,1rem)] shrink-0 text-valle-gold-400" />
          <span>{t.hero.location}</span>
        </div>
        <div className={statClass}>
          <Home className="h-[clamp(0.625rem,2.2vw,1rem)] w-[clamp(0.625rem,2.2vw,1rem)] shrink-0 text-valle-moss-400" />
          <span>{propertiesCountLabel}</span>
        </div>
        <div className={statClass}>
          <ShieldCheck className="h-[clamp(0.625rem,2.2vw,1rem)] w-[clamp(0.625rem,2.2vw,1rem)] shrink-0 text-valle-olive-400" />
          <span>{t.hero.certifiedHost}</span>
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const ctaInNav = useCtaInNav()
  const { locale, t } = useLanguage()
  const { properties: featuredProducts } = useFeaturedCarouselProperties(locale)

  useEffect(() => {
    featuredProducts.forEach((product) => {
      const img = new window.Image()
      img.src = product.image
    })
  }, [featuredProducts])

  // Deterministic pin progress: 0 when the track's top hits the viewport top,
  // 1 exactly when the sticky pin releases (track scrolled by its height minus one viewport).
  const scrollYProgress = useHeroScrollProgress()
  useEffect(() => {
    const onReset = () => scrollYProgress.set(0)

    window.addEventListener(HERO_SCROLL_RESET_EVENT, onReset)
    return () => window.removeEventListener(HERO_SCROLL_RESET_EVENT, onReset)
  }, [scrollYProgress])

  useEffect(() => {
    let frame = 0

    const update = () => {
      const el = containerRef.current
      if (!el) return
      const distance = el.offsetHeight - window.innerHeight
      if (distance <= 0) return
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / distance))
      scrollYProgress.set(p)
    }

    const scheduleUpdate = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [scrollYProgress])

  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [valleyBgReady, setValleyBgReady] = useState(false)

  useEffect(() => {
    const img = new window.Image()
    img.src = "/fondo-valle-1.png"
    if (img.complete) {
      setValleyBgReady(true)
      return
    }
    img.onload = () => setValleyBgReady(true)
  }, [])

  const handleQuickLook = (product: any) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  // Background valley zooms in on scroll; blur masks upscale softness and helps cards read.
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 2.35])
  const imageY = useTransform(scrollYProgress, [0, 0.5], ["0%", "12%"])
  const backgroundBlur = useTransform(scrollYProgress, [0, 0.12, 0.38, 0.58], [0, 0, 10, 16])
  const imageFilter = useTransform(backgroundBlur, (b) => `blur(${b}px)`)
  const mountainsScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])
  const mountainsY = useTransform(scrollYProgress, [0, 0.5], ["0%", "5%"])
  const mountainsOpacity = useTransform(scrollYProgress, [0, 0.22, 0.42], [1, 0.92, 0])
  // The haze/overlay deepens as we drop below the ridge line so cards stay legible.
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.32, 0.5, 0.6], [0.08, 0.3, 0.55, 0.68])

  // Headline lifts up and fades out early in the descent.
  const contentY = useTransform(scrollYProgress, [0.08, 0.38], [0, -140])
  const contentOpacity = useTransform(scrollYProgress, [0.08, 0.30], [1, 0])
  const contentScale = useTransform(scrollYProgress, [0.08, 0.38], [1, 1.12])

  // Info strip and scroll hint fade quickly once the descent begins.
  const chromeOpacity = useTransform(scrollYProgress, [0, 0.14], [1, 0])

  // Properties crossfade in as hero copy exits — no empty gap mid-scroll.
  const propsOpacity = useTransform(scrollYProgress, [0.16, 0.38], [0, 1])
  const propsScale = useTransform(scrollYProgress, [0.16, 0.42], [0.9, 1])
  const propsY = useTransform(scrollYProgress, [0.16, 0.42], [36, 0])
  // Only capture clicks once the cards are visible.
  const propsPointer = useTransform(scrollYProgress, (v) => (v > 0.34 ? "auto" : "none"))

  const AnimatedText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
    if (!text) return null

    const words = text.split(" ")
    let globalIndex = 0

    return (
      <span>
        {words.map((word, wordIndex) => {
          const wordStart = globalIndex
          globalIndex += word.length

          return (
            <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap">
              {word.split("").map((char, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: delay + (wordStart + index) * 0.03,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
              {wordIndex < words.length - 1 ? "\u00A0" : null}
            </span>
          )
        })}
      </span>
    )
  }

  return (
    // Tall scroll track: the descent + reveal plays out across this height, all pinned.
    <section ref={containerRef} className="relative h-[350vh]" id="propiedades">
      {/* Pinned viewport — everything happens in this same frame */}
      <div className="sticky top-0 h-screen overflow-hidden bg-valle-forest-900">
        {/* Valley background — deepest layer, zooms on scroll */}
        <motion.div
          className="absolute inset-0 z-0 bg-valle-forest-900"
          style={{ scale: imageScale, y: imageY }}
          initial={{ scale: 1.02 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <motion.div className="absolute inset-0 will-change-[filter]" style={{ filter: imageFilter }}>
            <Image
              src="/fondo-valle-1.png"
              alt={t.hero.bgAlt}
              fill
              className="object-cover object-center"
              priority
              fetchPriority="high"
              sizes="100vw"
              onLoad={() => setValleyBgReady(true)}
            />
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/50"
            style={{ opacity: overlayOpacity }}
          />
        </motion.div>

        {/* Logo + headline + CTA — single column, vertically centered in valley */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-[var(--site-header-height)] bottom-[calc(var(--hero-ridge-clearance)+var(--hero-bottom-chrome-height))] z-10 flex items-center justify-center overflow-hidden px-4 sm:px-6"
          style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
        >
          <div className="container-custom pointer-events-auto flex w-full max-h-full flex-col items-center justify-center text-center text-white">
            <AnimatePresence mode="wait">
              {!ctaInNav && <BrandLogo key="hero-logo" variant="hero" className="hero-logo-mark shrink-0" />}
            </AnimatePresence>

            <div className="w-full shrink-0 pt-[var(--hero-logo-gap)]">
              <Reveal className="w-full">
                <h1 className="mx-auto mb-4 w-full drop-shadow-[0_4px_40px_rgba(0,0,0,0.65)] sm:mb-5 md:mb-6">
                  <span className="flex w-full justify-center text-[clamp(1.15rem,4.8vw,2.75rem)] font-black leading-[1.05] tracking-tight text-white">
                    <AnimatedText text={t.hero.title1} delay={0.5} />
                  </span>
                  <span className="font-display mt-1.5 flex w-full justify-center sm:mt-2">
                    <span className="whitespace-nowrap text-[clamp(1.35rem,min(7vw,7vh),4.75rem)] font-light italic leading-none tracking-[0.01em] text-white">
                      <AnimatedText text={t.hero.title2} delay={1.1} />
                    </span>
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.2} className="w-full">
                <motion.p
                  className="mx-auto mb-6 max-w-2xl text-pretty text-base leading-relaxed text-white/90 drop-shadow-[0_2px_16px_rgba(0,0,0,0.75)] sm:mb-7 sm:text-lg md:mb-8 md:text-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                  {t.hero.subtitle}
                </motion.p>
              </Reveal>

              <AnimatePresence>
                {!ctaInNav && (
                  <motion.div
                    key="hero-pre-reservar"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -10 }}
                    transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="flex justify-center"
                  >
                    <PreReservarButton variant="hero" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Mountain ridges — foreground frame; visible only once valley bg is ready */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none opacity-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: valleyBgReady ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ scale: mountainsScale, y: mountainsY, opacity: mountainsOpacity }}
          >
            <Image
              src="/fondo-valle-montanas.png"
              alt=""
              aria-hidden
              fill
              className="object-cover object-bottom"
              loading="eager"
              sizes="100vw"
            />
          </motion.div>
        </motion.div>

        {/* Bottom bar — on top of mountains at the lower edge */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-30 flex justify-center"
          style={{ opacity: chromeOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mb-[max(1.25rem,env(safe-area-inset-bottom))] w-full px-[clamp(0.375rem,2vw,3rem)] md:container-custom md:px-[var(--space-6)]"
          >
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <HeroChromeStatsRow />

              <div className="flex flex-col items-center gap-1 text-white/80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
                <span className="text-[10px] tracking-[0.25em] uppercase sm:text-xs">{t.hero.diveIn}</span>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                >
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Properties — appear as the descent completes */}
        <motion.div
          id="propiedades-destacadas"
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[var(--site-header-height)] z-[25] flex items-center pb-4 sm:pb-6"
          style={{ opacity: propsOpacity, scale: propsScale, y: propsY }}
        >
          <div className="w-full">
            <div className="container-custom">
              <div className="mb-4 text-center text-white sm:mb-6 lg:mb-8">
                <h2 className="mb-2 text-balance text-2xl font-bold sm:mb-3 sm:text-3xl lg:text-5xl">
                  {t.hero.featuredTitle}{" "}
                  <span className="italic font-light">{t.hero.featuredTitleEm}</span>
                </h2>
                <p className="mx-auto max-w-2xl text-pretty text-white/80">{t.hero.featuredSubtitle}</p>
              </div>
            </div>

            <motion.div style={{ pointerEvents: propsPointer }}>
              <PropertiesCarousel properties={featuredProducts} onQuickLook={handleQuickLook} />
            </motion.div>
          </div>
        </motion.div>

      </div>

      <QuickLookModal product={selectedProduct} isOpen={isModalOpen} onClose={closeModal} />
    </section>
  )
}
