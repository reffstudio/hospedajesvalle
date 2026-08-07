"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useMotionValue, type MotionValue } from "framer-motion"

/** When hero scroll animation begins, the CTA moves from hero into the navbar. */
const CTA_NAV_THRESHOLD = 0.06
/** Scroll back near the top to return the CTA to the hero. */
const CTA_HERO_RESET_THRESHOLD = 0.02

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

/** Latches once the hero CTA hands off — stays in nav after the hero unpins. Resets only near page top. */
function useCtaHandedOffToNav() {
  const scrollYProgress = useOptionalHeroScrollProgress()
  const [handedOff, setHandedOff] = useState(() =>
    scrollYProgress ? scrollYProgress.get() > CTA_NAV_THRESHOLD : true,
  )

  useEffect(() => {
    if (!scrollYProgress) {
      setHandedOff(true)
      return
    }

    const update = (value: number) => {
      if (value > CTA_NAV_THRESHOLD) {
        setHandedOff(true)
      } else if (value <= CTA_HERO_RESET_THRESHOLD) {
        setHandedOff(false)
      }
    }

    update(scrollYProgress.get())
    return scrollYProgress.on("change", update)
  }, [scrollYProgress])

  return handedOff
}

export function useCtaInNav() {
  return useCtaHandedOffToNav()
}

export function useOptionalHeroScrollProgress() {
  return useContext(HeroScrollContext)
}

/** Nav reserve CTA: hidden on home hero, visible once the hero CTA hands off on scroll. Always visible off-home. */
export function useNavReserveButtonVisible() {
  return useCtaHandedOffToNav()
}
