"use client"

import { AnimatePresence, motion } from "framer-motion"
import { BrandLogo } from "./brand-logo"
import { LanguageSwitcher } from "./language-switcher"
import { PreReservarButton } from "./pre-reservar-button"
import { SiteNavDesktop, SiteNavMobile, type SiteNavLink } from "./site-nav"
import { useNavReserveButtonVisible } from "./hero-scroll-context"
import { cn } from "@/lib/utils"

type SiteHeaderBarProps = {
  links: SiteNavLink[]
  logoHref?: string
  className?: string
}

const ease = [0.21, 0.47, 0.32, 0.98] as const

const navReserveTransition = {
  duration: 0.28,
  ease,
} as const

const navReserveEnter = {
  initial: { opacity: 0, y: 8, scale: 0.92 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.94 },
  transition: navReserveTransition,
} as const

function MobileHeaderTopRow({ logoHref }: { logoHref: string }) {
  const showReserveButton = useNavReserveButtonVisible()

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pb-2">
      <BrandLogo variant="nav" className="justify-self-start" href={logoHref} />

      <div className="flex justify-center">
        <AnimatePresence>
          {showReserveButton && (
            <motion.div
              key="nav-pre-reservar-mobile"
              {...navReserveEnter}
              className="shrink-0"
            >
              <PreReservarButton
                variant="nav"
                prominent
                className="px-4 py-2 text-[9px] tracking-[0.14em] sm:px-5 sm:py-2.5 sm:text-[10px] sm:tracking-[0.16em]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LanguageSwitcher variant="inline" compact className="justify-self-end" />
    </div>
  )
}

function DesktopHeaderRow({ links, logoHref }: { links: SiteNavLink[]; logoHref: string }) {
  const showReserveButton = useNavReserveButtonVisible()

  return (
    <div className="hidden h-[var(--site-header-height)] items-center gap-3 md:flex lg:gap-5">
      <BrandLogo variant="nav" className="shrink-0" href={logoHref} />
      <SiteNavDesktop links={links} />
      <AnimatePresence>
        {showReserveButton && (
          <motion.div
            key="nav-pre-reservar"
            {...navReserveEnter}
            className="shrink-0"
          >
            <PreReservarButton
              variant="nav"
              className="px-4 py-2 text-[10px] tracking-[0.14em] lg:px-6 lg:py-3 lg:text-xs lg:tracking-[0.18em]"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <LanguageSwitcher variant="inline" compact className="shrink-0" />
    </div>
  )
}

export function SiteHeaderBar({ links, logoHref = "/", className }: SiteHeaderBarProps) {
  return (
    <div className={cn(className)}>
      {/* Mobile: two rows */}
      <div className="flex flex-col py-2 md:hidden">
        <MobileHeaderTopRow logoHref={logoHref} />
        <SiteNavMobile links={links} />
      </div>

      {/* Desktop: single row — logo · sections · pre-reserve · language */}
      <DesktopHeaderRow links={links} logoHref={logoHref} />
    </div>
  )
}
