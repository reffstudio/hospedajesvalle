"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMemo } from "react"
import { Building2, CalendarCheck, ExternalLink, LayoutGrid, LogOut } from "lucide-react"
import { useLeadStore } from "@/lib/dashboard/lead-store"
import { usePropertyInquiryStore } from "@/lib/dashboard/property-inquiry-store"
import { cn } from "@/lib/utils"
import { useDashboardAuth } from "./dashboard-auth-provider"
import { DashboardNotifications } from "./dashboard-notifications"
import { DashboardToaster } from "./dashboard-toaster"

const navItems = [
  { href: "/dashboard/properties", label: "Propiedades", icon: LayoutGrid, countKey: null },
  { href: "/dashboard/pre-reservations", label: "Pre-reservas", icon: CalendarCheck, countKey: "preReservations" as const },
  {
    href: "/dashboard/property-inquiries",
    label: "Nuevas Propiedades",
    icon: Building2,
    countKey: "propertyInquiries" as const,
  },
]

function NavBadge({ count, active }: { count: number; active: boolean }) {
  if (count <= 0) return null

  return (
    <span
      className={cn(
        "ml-auto inline-flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none",
        active ? "bg-white text-valle-forest-900" : "bg-valle-wine-600 text-white",
      )}
      aria-label={`${count} sin revisar`}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { email, logout } = useDashboardAuth()
  const { leads } = useLeadStore()
  const { inquiries } = usePropertyInquiryStore()

  const newCounts = useMemo(
    () => ({
      preReservations: leads.filter((lead) => lead.status === "new").length,
      propertyInquiries: inquiries.filter((inquiry) => inquiry.status === "new").length,
    }),
    [leads, inquiries],
  )

  const handleLogout = async () => {
    await logout()
    router.replace("/dashboard/login")
  }

  const activeNavItem = navItems.find((item) => pathname.startsWith(item.href)) ?? navItems[0]

  const getCount = (key: (typeof navItems)[number]["countKey"]) => {
    if (!key) return 0
    return newCounts[key]
  }

  return (
    <>
      <DashboardToaster />
      <DashboardNotifications />
      <div className="min-h-screen bg-valle-sage-50">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 border-r border-valle-sage-200/90 bg-valle-cream-50 lg:flex lg:flex-col">
          <div className="border-b border-valle-sage-200/90 px-5 py-5">
            <Link href="/dashboard/properties" className="block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-valle-forest-500">
                Hospedajes Valle
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-valle-forest-900">Panel</p>
            </Link>
            {email ? (
              <p className="mt-2 truncate text-xs text-valle-forest-600">{email}</p>
            ) : null}
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href)
              const count = getCount(item.countKey)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-valle-forest-900 text-white"
                      : "text-valle-forest-700 hover:bg-white hover:text-valle-forest-900",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 truncate">{item.label}</span>
                  <NavBadge count={count} active={active} />
                </Link>
              )
            })}
          </nav>

          <div className="space-y-1 border-t border-valle-sage-200/90 px-3 py-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-valle-forest-700 transition-colors hover:bg-white hover:text-valle-forest-900"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              Ver sitio
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-valle-wine-700 transition-colors hover:bg-valle-wine-50"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-valle-sage-200/90 bg-valle-cream-50/95 backdrop-blur-md lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-valle-forest-500">Panel</p>
                <p className="text-sm font-semibold text-valle-forest-900">{activeNavItem.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  target="_blank"
                  className="rounded-full border border-valle-sage-300 px-3 py-1.5 text-xs font-medium text-valle-forest-700"
                >
                  Ver sitio
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-valle-sage-300 px-3 py-1.5 text-xs font-medium text-valle-wine-700"
                >
                  Salir
                </button>
              </div>
            </div>
            <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href)
                const count = getCount(item.countKey)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                      active
                        ? "bg-valle-forest-900 text-white"
                        : "bg-white text-valle-forest-700 ring-1 ring-valle-sage-200",
                    )}
                  >
                    {item.label}
                    {count > 0 ? (
                      <span
                        className={cn(
                          "inline-flex min-h-[1rem] min-w-[1rem] items-center justify-center rounded-full px-1 text-[9px] font-bold",
                          active ? "bg-white text-valle-forest-900" : "bg-valle-wine-600 text-white",
                        )}
                      >
                        {count > 99 ? "99+" : count}
                      </span>
                    ) : null}
                  </Link>
                )
              })}
            </nav>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
    </>
  )
}
