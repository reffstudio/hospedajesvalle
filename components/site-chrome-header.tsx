"use client"

import { SiteHeaderBar } from "./site-header-bar"
import { useLanguage } from "./language-provider"

export function SiteChromeHeader() {
  const { t } = useLanguage()

  const navLinks = [
    {
      name: t.nav.properties,
      mobileLabel: t.nav.propertiesMobile,
      href: "/#propiedades-destacadas",
      sectionId: "propiedades",
    },
    {
      name: t.nav.experiences,
      mobileLabel: t.nav.experiencesMobile,
      href: "/#descubre-el-valle",
      sectionId: "descubre-el-valle",
    },
    { name: t.nav.reviews, mobileLabel: t.nav.reviewsMobile, href: "/#reviews", sectionId: "reviews" },
  ]

  return (
    <header className="nav-glass nav-glass--elevated fixed top-0 left-0 right-0 z-50">
      <div className="container-custom">
        <SiteHeaderBar links={navLinks} logoHref="/" />
      </div>
    </header>
  )
}
