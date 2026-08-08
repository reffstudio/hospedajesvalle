import type { Locale } from "@/lib/i18n/types"
import {
  PRE_RESERVATION_LEAD_STATUSES,
  PRE_RESERVATION_STATUS_FILTER_LABELS,
  PRE_RESERVATION_STATUS_FILTERS,
  PRE_RESERVATION_STATUS_LABELS,
  PRE_RESERVATION_STATUS_STYLES,
  type PreReservationLeadStatus,
  type PreReservationStatusFilter,
} from "@/lib/dashboard/lead-types"

export type DashboardPropertyInquiryLead = {
  id: string
  name: string
  email: string
  phone: string
  propertyDetails: string
  locale: Locale
  status: PreReservationLeadStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export type DashboardPropertyInquiryLeadUpdate = {
  status?: PreReservationLeadStatus
  notes?: string
}

export {
  PRE_RESERVATION_LEAD_STATUSES as PROPERTY_INQUIRY_STATUSES,
  PRE_RESERVATION_STATUS_LABELS as PROPERTY_INQUIRY_STATUS_LABELS,
  PRE_RESERVATION_STATUS_STYLES as PROPERTY_INQUIRY_STATUS_STYLES,
  PRE_RESERVATION_STATUS_FILTERS as PROPERTY_INQUIRY_STATUS_FILTERS,
  PRE_RESERVATION_STATUS_FILTER_LABELS as PROPERTY_INQUIRY_STATUS_FILTER_LABELS,
  type PreReservationStatusFilter as PropertyInquiryStatusFilter,
}
