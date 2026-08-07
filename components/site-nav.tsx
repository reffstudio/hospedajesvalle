"use client"

import { useEffect, useMemo, useState, type MouseEvent } from "react"
import { usePathname } from "next/navigation"
import { Home } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  HERO_FEATURED_PROPERTIES_HASH,
  HERO_SCROLL_RESET_EVENT,
} from "@/lib/hero-featured-scroll"
import {
  smoothScrollToHeroFeatured,
  smoothScrollToHome,
  smoothScrollToSection,
} from "@/lib/smooth-scroll"
import { useOptionalHeroScrollProgress } from "./hero-scroll-context"
import { useLanguage } from "./language-provider"

export type SiteNavLink = {
  name: string
  mobileLabel?: string
  href: string
  sectionId: string
}

type SiteNavLinksProps = {
  links: SiteNavLink[]
}

const HOME_HERO_THRESHOLD = 0.32
const SCROLL_SECTION_IDS = ["propiedades", "descubre-el-valle", "reviews"] as const

function isHomeHashLink(href: string) {
  return href.startsWith("#") || href.startsWith("/#")
}

function useSiteNavState(links: SiteNavLink[]) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const heroProgress = useOptionalHeroScrollProgress()
  const [activeSectionId, setActiveSectionId] = useState("home")

  const sectionLabels = useMemo(
    () => ({
      home: t.nav.home,
      ...Object.fromEntries(links.map((link) => [link.sectionId, link.name])),
    }),
    [links, t.nav.home],
  )

  const menuLinks = useMemo(
    () => [
      {
        sectionId: "home",
        name: t.nav.home,
        href: pathname === "/" ? "#" : "/",
      },
      ...links,
    ],
    [links, pathname, t.nav.home],
  )

  useEffect(() => {
    if (pathname === "/propiedades") {
      setActiveSectionId("propiedades")
      return
    }

    if (pathname !== "/") {
      setActiveSectionId("home")
      return
    }

    const update = () => {
      const progress = heroProgress?.get() ?? 1
      if (progress < HOME_HERO_THRESHOLD) {
        setActiveSectionId("home")
        return
      }

      const marker = window.innerHeight * 0.32
      let current: (typeof SCROLL_SECTION_IDS)[number] = "propiedades"

      for (const id of SCROLL_SECTION_IDS) {
        const element = document.getElementById(id)
        if (!element) continue
        if (element.getBoundingClientRect().top <= marker) current = id
      }

      setActiveSectionId(current)
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)

    const unsubscribe = heroProgress?.on("change", update)

    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      unsubscribe?.()
    }
  }, [heroProgress, pathname])

  useEffect(() => {
    if (pathname !== "/") return

    const hash = window.location.hash.replace("#", "")
    if (hash === HERO_FEATURED_PROPERTIES_HASH) {
      setActiveSectionId("propiedades")
      return
    }

    if (hash && hash in sectionLabels) {
      setActiveSectionId(hash)
    }
  }, [pathname, sectionLabels])

  const handleMenuClick = (link: (typeof menuLinks)[number], event?: MouseEvent<HTMLAnchorElement>) => {
    if (link.sectionId === "home") {
      if (pathname === "/" && link.href === "#") {
        event?.preventDefault()
        void smoothScrollToHome()
      }
      return
    }

    if (pathname !== "/") return

    if (isHomeHashLink(link.href)) {
      event?.preventDefault()
      if (link.sectionId === "propiedades") {
        void smoothScrollToHeroFeatured()
      } else {
        void smoothScrollToSection(link.sectionId)
      }
    }
  }

  return {
    t,
    activeSectionId,
    menuLinks,
    handleMenuClick,
  }
}

/** Mobile row 2 — all sections in one horizontal line. */
export function SiteNavMobile({ links }: SiteNavLinksProps) {
  const { t, activeSectionId, menuLinks, handleMenuClick } = useSiteNavState(links)

  return (
    <nav
      className="flex w-full items-center justify-between border-t border-white/10 pt-2 md:hidden"
      aria-label={t.nav.mainAria}
    >
      {menuLinks.map((link) => {
        const isActive = link.sectionId === activeSectionId
        const isHome = link.sectionId === "home"
        const label = link.mobileLabel ?? link.name

        return (
          <a
            key={link.sectionId}
            href={link.href}
            title={link.name}
            aria-current={isActive ? "page" : undefined}
            aria-label={isHome ? link.name : undefined}
            onClick={(event) => handleMenuClick(link, event)}
            className={cn(
              "site-nav-mobile-link inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-1 py-1 transition-colors",
              isHome && "w-11",
              isActive ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/8 hover:text-white",
            )}
          >
            {isHome ? (
              <>
                <Home className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="sr-only">{link.name}</span>
              </>
            ) : (
              label
            )}
          </a>
        )
      })}
    </nav>
  )
}

export function SiteNavDesktop({ links }: SiteNavLinksProps) {
  const { t, activeSectionId, menuLinks, handleMenuClick } = useSiteNavState(links)

  return (
    <nav
      className="hidden min-w-0 flex-1 items-center justify-center gap-3 md:flex lg:gap-5 xl:gap-6"
      aria-label={t.nav.mainAria}
    >
      {menuLinks.map((link) => {
        const isActive = link.sectionId === activeSectionId
        const isHome = link.sectionId === "home"

        return (
          <a
            key={link.sectionId}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            aria-label={isHome ? link.name : undefined}
            onClick={(event) => handleMenuClick(link, event)}
            className={cn(
              "nav-link inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] transition-colors lg:px-3 lg:py-2 lg:text-xs xl:text-sm",
              isActive ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/8 hover:text-white",
            )}
          >
            {isHome ? (
              <>
                <Home className="h-4 w-4 shrink-0" aria-hidden />
                <span className="sr-only">{link.name}</span>
              </>
            ) : (
              link.name
            )}
          </a>
        )
      })}
    </nav>
  )
}

/** @deprecated Prefer SiteNavMobile + SiteNavDesktop in SiteHeaderBar */
export function SiteNav({ links }: SiteNavLinksProps) {
  return (
    <>
      <SiteNavMobile links={links} />
      <SiteNavDesktop links={links} />
    </>
  )
}
