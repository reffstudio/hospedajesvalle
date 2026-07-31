"use client"

import { DashboardAuthProvider } from "@/components/dashboard/dashboard-auth-provider"
import { PropertyStoreProvider } from "@/lib/dashboard/property-store"

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <DashboardAuthProvider>
      <PropertyStoreProvider>{children}</PropertyStoreProvider>
    </DashboardAuthProvider>
  )
}
