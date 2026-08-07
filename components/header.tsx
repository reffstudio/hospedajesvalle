"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { SiteHeaderBar } from "./site-header-bar"
import { useLanguage } from "./language-provider"

const ease = [0.21, 0.47, 0.32, 0.98] as const

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { t } = useLanguage()

  const navLinks = [
    {
      name: t.nav.properties,
      mobileLabel: t.nav.propertiesMobile,
      href: "#propiedades-destacadas",
      sectionId: "propiedades",
    },
    {
      name: t.nav.experiences,
      mobileLabel: t.nav.experiencesMobile,
      href: "#descubre-el-valle",
      sectionId: "descubre-el-valle",
    },
    { name: t.nav.reviews, href: "#reviews", sectionId: "reviews" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className={cn(
        "nav-glass nav-glass--elevated fixed top-0 left-0 right-0 z-50 transition-[background,box-shadow,border-color] duration-500",
        isScrolled && "shadow-[0_8px_32px_rgba(0,0,0,0.18)]",
      )}
    >
      <div className="container-custom">
        <SiteHeaderBar links={navLinks} />
      </div>
    </motion.header>
  )
}
