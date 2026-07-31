"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useMotionValue, useMotionValueEvent, type MotionValue } from "framer-motion"

/** When hero scroll animation begins, the CTA moves from hero into the navbar. */
const CTA_NAV_THRESHOLD = 0.06

const HeroScrollContext = createContext<MotionValue<number> | null>(null)

export function HeroScrollProvider({ children }: { children: ReactNode }) {
  const scrollYProgress = useMotionValue(0)

  return <HeroScrollContext.Provider value={scrollYProgress}>{children}</HeroScrollContext.Provider>
}

export function useHeroScrollProgress() {
  const ctx = useContext(HeroScrollContext)
  if (!ctx) {
    throw new Error("useHeroScrollProgress must be used within a HeroScrollProvider")
  }
  return ctx
}

export function useCtaInNav() {
  const scrollYProgress = useHeroScrollProgress()
  const [ctaInNav, setCtaInNav] = useState(() => scrollYProgress.get() > CTA_NAV_THRESHOLD)

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setCtaInNav(v > CTA_NAV_THRESHOLD)
  })

  useEffect(() => {
    setCtaInNav(scrollYProgress.get() > CTA_NAV_THRESHOLD)
  }, [scrollYProgress])

  return ctaInNav
}

export function useOptionalHeroScrollProgress() {
  return useContext(HeroScrollContext)
}
