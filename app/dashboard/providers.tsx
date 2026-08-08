"use client"

import { DashboardAuthProvider } from "@/components/dashboard/dashboard-auth-provider"
import { LeadStoreProvider } from "@/lib/dashboard/lead-store"
import { PropertyInquiryStoreProvider } from "@/lib/dashboard/property-inquiry-store"
import { PropertyStoreProvider } from "@/lib/dashboard/property-store"

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <DashboardAuthProvider>
      <PropertyStoreProvider>
        <LeadStoreProvider>
          <PropertyInquiryStoreProvider>{children}</PropertyInquiryStoreProvider>
        </LeadStoreProvider>
      </PropertyStoreProvider>
    </DashboardAuthProvider>
  )
}
