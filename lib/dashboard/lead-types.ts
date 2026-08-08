import type { Locale } from "@/lib/i18n/types"

export const PRE_RESERVATION_LEAD_STATUSES = [
  "new",
  "contacted",
  "scheduled",
  "rejected",
  "archived",
] as const

export type PreReservationLeadStatus = (typeof PRE_RESERVATION_LEAD_STATUSES)[number]

export type DashboardPreReservationLead = {
  id: string
  name: string
  email: string
  phone: string
  guests: number
  propertyIds: string[]
  checkIn: string
  checkOut: string
  locale: Locale
  status: PreReservationLeadStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export type DashboardPreReservationLeadUpdate = {
  status?: PreReservationLeadStatus
  notes?: string
}

export const PRE_RESERVATION_STATUS_LABELS: Record<PreReservationLeadStatus, string> = {
  new: "Nueva",
  contacted: "Contactado",
  scheduled: "Agendada",
  rejected: "Rechazada",
  archived: "Archivada",
}

export const PRE_RESERVATION_STATUS_STYLES: Record<PreReservationLeadStatus, string> = {
  new: "bg-sky-50 text-sky-800 ring-sky-200",
  contacted: "bg-amber-50 text-amber-800 ring-amber-200",
  scheduled: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-valle-wine-50 text-valle-wine-800 ring-valle-wine-200",
  archived: "bg-neutral-100 text-neutral-700 ring-neutral-200",
}

export type PreReservationStatusFilter = "all" | PreReservationLeadStatus

export const PRE_RESERVATION_STATUS_FILTERS: PreReservationStatusFilter[] = [
  "all",
  "new",
  "contacted",
  "scheduled",
  "rejected",
  "archived",
]

export const PRE_RESERVATION_STATUS_FILTER_LABELS: Record<PreReservationStatusFilter, string> = {
  all: "Todas",
  ...PRE_RESERVATION_STATUS_LABELS,
}
