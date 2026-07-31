import type { Metadata } from "next"
import { DashboardProviders } from "./providers"
import { DashboardGuard } from "@/components/dashboard/dashboard-guard"

export const metadata: Metadata = {
  title: "Panel | Hospedajes Valle",
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <DashboardGuard>{children}</DashboardGuard>
    </DashboardProviders>
  )
}
