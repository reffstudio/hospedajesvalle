import { Suspense } from "react"
import { PropertyInquiryListPage } from "@/components/dashboard/property-inquiry-list-page"

export default function DashboardPropertyInquiriesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-valle-forest-600">Cargando solicitudes...</p>}>
      <PropertyInquiryListPage />
    </Suspense>
  )
}
