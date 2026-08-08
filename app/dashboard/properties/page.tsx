import { Suspense } from "react"
import { PropertyListPage } from "@/components/dashboard/property-list-page"

export default function DashboardPropertiesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-valle-forest-600">Cargando catálogo...</p>}>
      <PropertyListPage />
    </Suspense>
  )
}
