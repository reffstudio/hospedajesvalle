"use client"

import { BrandLogo } from "./brand-logo"
import { LanguageSwitcher } from "./language-switcher"
import { PreReservarButton } from "./pre-reservar-button"
import { SiteNavDesktop, SiteNavMobile, type SiteNavLink } from "./site-nav"
import { cn } from "@/lib/utils"

type SiteHeaderBarProps = {
  links: SiteNavLink[]
  logoHref?: string
  className?: string
}

function HeaderActions() {
  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <PreReservarButton
        variant="nav"
        className="px-3 py-2 text-[9px] tracking-[0.12em] sm:px-5 sm:py-2.5 sm:text-[10px] sm:tracking-[0.16em] lg:px-6 lg:py-3 lg:text-xs lg:tracking-[0.18em]"
      />
      <LanguageSwitcher variant="inline" compact />
    </div>
  )
}

export function SiteHeaderBar({ links, logoHref = "/", className }: SiteHeaderBarProps) {
  return (
    <div className={cn(className)}>
      {/* Mobile: logo + actions on top, full-width section menu below */}
      <div className="flex flex-col gap-2 py-2 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo variant="nav" className="shrink-0" href={logoHref} />
          <HeaderActions />
        </div>
        <SiteNavMobile links={links} />
      </div>

      {/* Desktop: single row */}
      <div className="hidden h-[var(--site-header-height)] items-center justify-between gap-6 lg:flex">
        <BrandLogo variant="nav" className="shrink-0" href={logoHref} />
        <div className="flex flex-1 items-center gap-8">
          <SiteNavDesktop links={links} />
        </div>
        <HeaderActions />
      </div>
    </div>
  )
}
