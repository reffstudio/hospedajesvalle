import type { SupabaseClient } from "@supabase/supabase-js"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { mapLeadRowToDashboard } from "@/lib/supabase/repository/dashboard-leads"
import { mapPropertyInquiryRowToDashboard } from "@/lib/supabase/repository/dashboard-property-inquiries"
import type { PreReservationLeadRow, PropertyInquiryLeadRow } from "@/lib/supabase/database.types"

type LeadHandlers = {
  onInsert: (lead: ReturnType<typeof mapLeadRowToDashboard>) => void
  onUpdate: (lead: ReturnType<typeof mapLeadRowToDashboard>) => void
}

type InquiryHandlers = {
  onInsert: (inquiry: ReturnType<typeof mapPropertyInquiryRowToDashboard>) => void
  onUpdate: (inquiry: ReturnType<typeof mapPropertyInquiryRowToDashboard>) => void
}

export function subscribePreReservationLeadChanges(
  supabase: SupabaseClient,
  handlers: LeadHandlers,
): RealtimeChannel {
  return supabase
    .channel("dashboard-pre-reservation-leads")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "pre_reservation_leads" },
      (payload) => {
        handlers.onInsert(mapLeadRowToDashboard(payload.new as PreReservationLeadRow))
      },
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "pre_reservation_leads" },
      (payload) => {
        handlers.onUpdate(mapLeadRowToDashboard(payload.new as PreReservationLeadRow))
      },
    )
    .subscribe()
}

export function subscribePropertyInquiryLeadChanges(
  supabase: SupabaseClient,
  handlers: InquiryHandlers,
): RealtimeChannel {
  return supabase
    .channel("dashboard-property-inquiry-leads")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "property_inquiry_leads" },
      (payload) => {
        handlers.onInsert(mapPropertyInquiryRowToDashboard(payload.new as PropertyInquiryLeadRow))
      },
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "property_inquiry_leads" },
      (payload) => {
        handlers.onUpdate(mapPropertyInquiryRowToDashboard(payload.new as PropertyInquiryLeadRow))
      },
    )
    .subscribe()
}
