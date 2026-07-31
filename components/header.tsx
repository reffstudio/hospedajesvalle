"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useCtaInNav } from "./hero-scroll-context"
import { SiteHeaderBar } from "./site-header-bar"
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
            <SiteHeaderBar links={navLinks} />
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  )
}
