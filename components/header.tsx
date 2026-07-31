"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useCtaInNav } from "./hero-scroll-context"
import { PreReservarButton } from "./pre-reservar-button"
import { BrandLogo } from "./brand-logo"
import { LanguageSwitcher } from "./language-switcher"
import { SiteNav } from "./site-nav"
import { useLanguage } from "./language-provider"

const ease = [0.21, 0.47, 0.32, 0.98] as const

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const ctaInNav = useCtaInNav()
  const { t } = useLanguage()

  const navLinks = [
    { name: t.nav.properties, href: "/propiedades", sectionId: "propiedades" },
    { name: t.nav.experiences, href: "#descubre-el-valle", sectionId: "descubre-el-valle" },
    { name: t.nav.reviews, href: "#reviews", sectionId: "reviews" },
    { name: t.nav.management, href: "#administracion", sectionId: "administracion" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const showHeader = ctaInNav

  return (
    <AnimatePresence>
      {showHeader && (
        <motion.header
          key="site-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease }}
          className={cn(
            "nav-glass fixed top-0 left-0 right-0 z-50 transition-[background,box-shadow,border-color] duration-500",
            isScrolled && "nav-glass--elevated",
          )}
        >
          <div className="container-custom">
            <div className="flex h-[var(--site-header-height)] items-center justify-between gap-3 lg:gap-6">
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4 lg:gap-8">
                <BrandLogo variant="nav" className="shrink-0" />
                <SiteNav links={navLinks} />
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <PreReservarButton
                  variant="nav"
                  className="px-4 py-2.5 text-[10px] sm:px-6 sm:py-3 sm:text-xs"
                />
                <LanguageSwitcher variant="inline" />
              </div>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  )
}
