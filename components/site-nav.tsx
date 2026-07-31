"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOptionalHeroScrollProgress } from "./hero-scroll-context"
import { useLanguage } from "./language-provider"

export type SiteNavLink = {
  name: string
  href: string
  sectionId: string
}

type SiteNavProps = {
  links: SiteNavLink[]
}

const ease = [0.21, 0.47, 0.32, 0.98] as const
const HOME_HERO_THRESHOLD = 0.32
const SCROLL_SECTION_IDS = ["propiedades", "descubre-el-valle", "reviews", "administracion"] as const

function useActiveNavSection(links: SiteNavLink[]) {
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
    if (hash && hash in sectionLabels) {
      setActiveSectionId(hash)
    }
  }, [pathname, sectionLabels])

  const activeLabel = sectionLabels[activeSectionId] ?? t.nav.home

  return { activeSectionId, activeLabel }
}

export function SiteNav({ links }: SiteNavProps) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { activeSectionId, activeLabel } = useActiveNavSection(links)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const handleMenuClick = (link: (typeof menuLinks)[number]) => {
    setOpen(false)
    if (link.sectionId === "home" && link.href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <>
      <div ref={containerRef} className="relative lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={`${t.nav.menuToggleAria}: ${activeLabel}`}
          className={cn(
            "nav-link inline-flex max-w-[min(11rem,calc(100vw-12rem))] items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-white/85 transition-colors hover:bg-white/15 hover:text-white",
            open && "bg-white/15 text-white",
          )}
        >
          <span className="truncate">{activeLabel}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform duration-200", open && "rotate-180")} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.2, ease }}
              className="nav-dropdown absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-[12rem] overflow-hidden rounded-xl border border-white/12 py-1 shadow-lg"
              role="menu"
            >
              {menuLinks.map((link) => (
                <a
                  key={link.sectionId}
                  href={link.href}
                  role="menuitem"
                  aria-current={link.sectionId === activeSectionId ? "page" : undefined}
                  onClick={() => handleMenuClick(link)}
                  className={cn(
                    "nav-link block px-4 py-2.5 transition-colors hover:bg-white/10 hover:text-white",
                    link.sectionId === activeSectionId ? "text-white" : "text-white/80",
                  )}
                >
                  {link.name}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="hidden items-center gap-5 lg:flex xl:gap-6" aria-label={t.nav.mainAria}>
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="nav-link whitespace-nowrap text-white/80 transition-colors hover:text-white"
          >
            {link.name}
          </a>
        ))}
      </nav>
    </>
  )
}
