"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ExternalLink, LayoutGrid, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDashboardAuth } from "./dashboard-auth-provider"

const navItems = [{ href: "/dashboard/properties", label: "Propiedades", icon: LayoutGrid }]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { email, logout } = useDashboardAuth()

  const handleLogout = () => {
    logout()
    router.replace("/dashboard/login")
  }

  return (
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
                  {item.label}
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
                <p className="text-sm font-semibold text-valle-forest-900">Propiedades</p>
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
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
