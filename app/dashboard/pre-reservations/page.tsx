import { Suspense } from "react"
import { PreReservationListPage } from "@/components/dashboard/pre-reservation-list-page"

export default function DashboardPreReservationsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-valle-forest-600">Cargando pre-reservas...</p>}>
      <PreReservationListPage />
    </Suspense>
  )
}
