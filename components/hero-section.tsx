"use client"

import { motion, useTransform, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Home, ShieldCheck, ChevronDown } from "lucide-react"
import { Reveal } from "./reveal"
import { PropertiesCarousel } from "./properties-carousel"
import { QuickLookModal } from "./quick-look-modal"
import { getFeaturedCarouselProperties, getRoundedPropertyDisplayCount } from "@/lib/properties/queries"
import { useHeroScrollProgress, useCtaInNav } from "./hero-scroll-context"
import { useLanguage } from "./language-provider"
import { PreReservarButton } from "./pre-reservar-button"
import { BrandLogo } from "./brand-logo"

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const ctaInNav = useCtaInNav()
  const { locale, t, tf } = useLanguage()
  const featuredProducts = getFeaturedCarouselProperties(locale)
  const propertiesCountLabel = tf(t.hero.propertiesCount, {
    count: getRoundedPropertyDisplayCount(),
  })

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
  const contentY = useTransform(scrollYProgress, [0.08, 0.42], [0, -140])
  const contentOpacity = useTransform(scrollYProgress, [0.08, 0.35], [1, 0])
  const contentScale = useTransform(scrollYProgress, [0.08, 0.42], [1, 1.12])

  // Info strip and scroll hint fade quickly once the descent begins.
  const chromeOpacity = useTransform(scrollYProgress, [0, 0.14], [1, 0])

  // Properties materialize as the descent finishes, then hold fully visible until the pin releases.
  const propsOpacity = useTransform(scrollYProgress, [0.42, 0.6], [0, 1])
  const propsScale = useTransform(scrollYProgress, [0.42, 0.66], [0.86, 1])
  const propsY = useTransform(scrollYProgress, [0.42, 0.66], [60, 0])
  // Only capture clicks once the cards are visible.
  const propsPointer = useTransform(scrollYProgress, (v) => (v > 0.58 ? "auto" : "none"))

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

        {/* Logo + headline + CTA — sits inside the valley opening */}
        <div className="pointer-events-none absolute inset-x-0 top-[max(16%,calc(var(--site-header-height)+0.75rem))] z-10 flex justify-center sm:top-[max(14%,calc(var(--site-header-height)+0.75rem))] lg:top-[12%]">
          <div className="pointer-events-auto">
            <AnimatePresence mode="wait">
              {!ctaInNav && <BrandLogo key="hero-logo" variant="hero" />}
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center pt-[calc(var(--site-header-height)+1.5rem)] sm:pt-[calc(var(--site-header-height)+2rem)] lg:pt-32"
          style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
        >
          <div className="container-custom pointer-events-auto px-4 text-center text-white sm:px-6">
            <Reveal>
              <h1 className="@container mx-auto mb-6 w-full max-w-[94vw] drop-shadow-[0_4px_40px_rgba(0,0,0,0.65)] sm:max-w-none">
                <span className="block text-balance text-[clamp(1.15rem,4.8vw,2.75rem)] font-black leading-[1.05] tracking-tight text-white">
                  <AnimatedText text={t.hero.title1} delay={0.5} />
                </span>
                <span className="font-display mx-auto mt-1.5 block w-full text-center sm:mt-2">
                  <span className="inline-block max-w-full whitespace-nowrap text-[clamp(1.45rem,10.5cqw,4.75rem)] font-light italic leading-none tracking-[0.01em] text-white">
                    <AnimatedText text={t.hero.title2} delay={1.1} />
                  </span>
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <motion.p
                className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                {t.hero.subtitle}
              </motion.p>
            </Reveal>

            <AnimatePresence mode="wait">
              {!ctaInNav && <PreReservarButton key="hero-cta" variant="hero" />}
            </AnimatePresence>
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

        {/* Properties — appear as the descent completes */}
        <motion.div
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

        {/* Bottom bar — scroll hint + info strip */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-30 flex justify-center"
          style={{ opacity: chromeOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="container-custom mb-6 w-full"
          >
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="flex w-full max-w-full flex-nowrap items-center justify-center gap-x-[clamp(0.5rem,2.5vw,2rem)] text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
                <div className="flex shrink-0 items-center gap-[clamp(0.25rem,1vw,0.375rem)]">
                  <MapPin className="h-[clamp(0.75rem,2.5vw,1rem)] w-[clamp(0.75rem,2.5vw,1rem)] shrink-0 text-valle-gold-400" />
                  <span className="whitespace-nowrap text-[clamp(0.5625rem,2.4vw,0.875rem)] font-medium leading-none">
                    {t.hero.location}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-[clamp(0.25rem,1vw,0.375rem)]">
                  <Home className="h-[clamp(0.75rem,2.5vw,1rem)] w-[clamp(0.75rem,2.5vw,1rem)] shrink-0 text-valle-moss-400" />
                  <span className="whitespace-nowrap text-[clamp(0.5625rem,2.4vw,0.875rem)] font-medium leading-none">
                    {propertiesCountLabel}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-[clamp(0.25rem,1vw,0.375rem)]">
                  <ShieldCheck className="h-[clamp(0.75rem,2.5vw,1rem)] w-[clamp(0.75rem,2.5vw,1rem)] shrink-0 text-valle-olive-400" />
                  <span className="whitespace-nowrap text-[clamp(0.5625rem,2.4vw,0.875rem)] font-medium leading-none">
                    {t.hero.certifiedHost}
                  </span>
                </div>
              </div>

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
      </div>

      <QuickLookModal product={selectedProduct} isOpen={isModalOpen} onClose={closeModal} />
    </section>
  )
}
