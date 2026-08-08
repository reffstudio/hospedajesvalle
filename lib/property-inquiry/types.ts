import type { Locale } from "@/lib/i18n/types"

export type PropertyInquiryInput = {
  name: string
  email: string
  phone: string
  propertyDetails: string
  locale: Locale
}

export type PropertyInquiry = PropertyInquiryInput & {
  id: string
  status: import("@/lib/dashboard/lead-types").PreReservationLeadStatus
  notes: string
  createdAt: string
  updatedAt: string
}
