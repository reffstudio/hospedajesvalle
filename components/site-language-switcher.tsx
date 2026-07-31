"use client"

import { useCtaInNav } from "./hero-scroll-context"
import { LanguageSwitcher } from "./language-switcher"

export function SiteLanguageSwitcher() {
  const ctaInNav = useCtaInNav()

  if (ctaInNav) return null
  return <LanguageSwitcher variant="fixed" />
}
