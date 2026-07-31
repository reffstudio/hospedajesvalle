"use client"

import { BrandLogo } from "./brand-logo"
import { LanguageSwitcher } from "./language-switcher"
import { PreReservarButton } from "./pre-reservar-button"
import { SiteNav } from "./site-nav"
import { useLanguage } from "./language-provider"

export function SiteChromeHeader() {
  const { t } = useLanguage()

  const navLinks = [
    { name: t.nav.properties, href: "/propiedades", sectionId: "propiedades" },
    { name: t.nav.experiences, href: "/#descubre-el-valle", sectionId: "descubre-el-valle" },
    { name: t.nav.reviews, href: "/#reviews", sectionId: "reviews" },
    { name: t.nav.management, href: "/#administracion", sectionId: "administracion" },
  ]

  return (
    <header className="nav-glass nav-glass--elevated fixed top-0 left-0 right-0 z-50">
      <div className="container-custom">
        <div className="flex h-[var(--site-header-height)] items-center justify-between gap-3 lg:gap-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4 lg:gap-8">
            <BrandLogo variant="nav" className="shrink-0" href="/" />
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
    </header>
  )
}
