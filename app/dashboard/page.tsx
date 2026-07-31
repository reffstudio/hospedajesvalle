"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDashboardAuth } from "@/components/dashboard/dashboard-auth-provider"

export default function DashboardIndexPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useDashboardAuth()

  useEffect(() => {
    if (isLoading) return
    router.replace(isAuthenticated ? "/dashboard/properties" : "/dashboard/login")
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-valle-sage-50 text-sm text-valle-forest-600">
      Redirigiendo...
    </div>
  )
}
