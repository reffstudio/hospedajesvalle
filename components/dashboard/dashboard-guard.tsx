"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { DashboardShell } from "./dashboard-shell"
import { useDashboardAuth } from "./dashboard-auth-provider"

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useDashboardAuth()
  const isLoginRoute = pathname === "/dashboard/login"

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated && !isLoginRoute) {
      router.replace("/dashboard/login")
    }
    if (isAuthenticated && isLoginRoute) {
      router.replace("/dashboard/properties")
    }
  }, [isAuthenticated, isLoading, isLoginRoute, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-valle-sage-50 text-sm text-valle-forest-600">
        Cargando panel...
      </div>
    )
  }

  if (!isAuthenticated && !isLoginRoute) return null
  if (isAuthenticated && isLoginRoute) return null

  if (isLoginRoute) return <>{children}</>

  return <DashboardShell>{children}</DashboardShell>
}
