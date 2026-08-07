"use client"

import { useEffect, useLayoutEffect } from "react"
import { HERO_FEATURED_PROPERTIES_HASH } from "@/lib/hero-featured-scroll"
import { smoothScrollToSection } from "@/lib/smooth-scroll"

/** Smooth-scroll to hash targets when landing on home (direct URL or from another route). */
export function HomeHashScroll() {
  useLayoutEffect(() => {
    if (!window.location.hash) return
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const hash = window.location.hash.replace("#", "")
    if (!hash) return

    const run = () => {
      if (hash === HERO_FEATURED_PROPERTIES_HASH) {
        void smoothScrollToSection("propiedades")
        return
      }

      void smoothScrollToSection(hash)
    }

    const frame = requestAnimationFrame(() => requestAnimationFrame(run))
    return () => cancelAnimationFrame(frame)
  }, [])

  return null
}
