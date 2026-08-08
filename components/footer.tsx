"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Facebook, Instagram, MapPin } from "lucide-react"
import { useLanguage } from "./language-provider"
import { usePreReservation } from "./pre-reservation-context"

const linkClass =
  "text-[13px] leading-none text-valle-forest-700 transition-colors hover:text-valle-forest-900 lg:text-sm"

const socialClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-full border border-valle-sage-300/90 bg-white text-valle-forest-700 transition-colors hover:border-valle-forest-400/40 hover:text-valle-forest-900"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const pathname = usePathname()
  const { t } = useLanguage()
  const { open: openPreReservation } = usePreReservation()
  const isHome = pathname === "/"

  const sectionHref = (id: string) => (isHome ? `#${id}` : `/#${id}`)

  const navLinks = [
    { name: t.nav.properties, href: sectionHref("propiedades") },
    { name: t.carousel.fullList, href: "/propiedades" },
    { name: t.nav.experiences, href: sectionHref("descubre-el-valle") },
    { name: t.nav.reviews, href: sectionHref("reviews") },
    { name: t.nav.management, href: sectionHref("administracion") },
  ]

  const socialLinks = [
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/hospedajesvalle" },
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/hospedajesvalle" },
  ]

  return (
    <footer id="contacto" className="border-t border-valle-sage-200/90 bg-valle-cream-50">
      <div className="container-custom">
        <div className="flex flex-col gap-4 py-6 lg:py-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="min-w-0 space-y-1.5">
              <p className="text-base font-semibold tracking-tight text-valle-forest-900">{t.footer.brand}</p>
              <p className="max-w-sm text-sm leading-snug text-valle-forest-600">{t.footer.tagline}</p>
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-valle-forest-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-valle-gold-600" aria-hidden />
                <span>{t.hero.location}</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
              <button
                type="button"
                onClick={() => openPreReservation()}
                className="inline-flex items-center justify-center rounded-full border border-valle-forest-900/10 bg-white px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-valle-forest-900 shadow-[0_1px_2px_rgba(24,40,32,0.06)] transition-colors hover:border-valle-forest-900/18 hover:bg-valle-sage-50"
              >
                {t.common.preReserve}
              </button>

              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={socialClass}
                    aria-label={social.name}
                  >
                    <social.icon size={15} strokeWidth={1.75} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <nav aria-label={t.nav.mainAria} className="border-t border-valle-sage-200/90 pt-4">
            <ul className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2">
              {navLinks.map((link) => (
                <li key={link.href + link.name}>
                  <Link href={link.href} className={linkClass}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-valle-sage-200/90 py-3.5 sm:grid-cols-3 sm:items-center sm:gap-4">
          <div className="flex justify-center sm:justify-start">
            <Link
              href="/dashboard/login"
              className="inline-flex items-center justify-center rounded-full border border-valle-forest-900/10 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-valle-forest-800 shadow-[0_1px_2px_rgba(24,40,32,0.05)] transition-colors hover:border-valle-forest-900/18 hover:bg-valle-sage-50 hover:text-valle-forest-900"
            >
              {t.footer.adminPanel}
            </Link>
          </div>

          <p className="text-center text-[11px] leading-relaxed text-valle-forest-500">
            &copy; {currentYear} {t.footer.brand}. {t.footer.copyright}
          </p>

          <div className="flex justify-center sm:justify-end">
            <p className="flex items-center gap-1.5 text-[11px] leading-none text-valle-forest-500">
              <span>{t.footer.poweredBy}</span>
              <a
                href="https://www.reff.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center transition-opacity hover:opacity-80"
              >
                <img
                  src="/reff-studio-logo.png"
                  alt="REFF STUDIO"
                  width={1024}
                  height={138}
                  className="block h-[11px] w-auto mix-blend-multiply opacity-70 transition-opacity [filter:invert(1)] hover:opacity-90"
                />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
