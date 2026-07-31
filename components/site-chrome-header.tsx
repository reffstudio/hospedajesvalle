"use client"

import { SiteHeaderBar } from "./site-header-bar"
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
        <SiteHeaderBar links={navLinks} logoHref="/" />
      </div>
    </header>
  )
}
