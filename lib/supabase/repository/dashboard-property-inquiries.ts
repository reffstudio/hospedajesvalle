import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  DashboardPropertyInquiryLead,
  DashboardPropertyInquiryLeadUpdate,
} from "@/lib/dashboard/property-inquiry-types"
import { PRE_RESERVATION_LEAD_STATUSES } from "@/lib/dashboard/lead-types"
import type { PreReservationLeadStatus } from "@/lib/dashboard/lead-types"
import type { PropertyInquiryLeadRow } from "@/lib/supabase/database.types"

function parseInquiryStatus(value: string): PreReservationLeadStatus {
  if (PRE_RESERVATION_LEAD_STATUSES.includes(value as PreReservationLeadStatus)) {
    return value as PreReservationLeadStatus
  }
  return "new"
}

export function mapPropertyInquiryRowToDashboard(row: PropertyInquiryLeadRow): DashboardPropertyInquiryLead {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    propertyDetails: row.property_details,
    locale: row.locale,
    status: parseInquiryStatus(row.status ?? "new"),
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  }
}

export async function listDashboardPropertyInquiries(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("property_inquiry_leads")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapPropertyInquiryRowToDashboard(row as PropertyInquiryLeadRow))
}

export async function updateDashboardPropertyInquiry(
  supabase: SupabaseClient,
  id: string,
  patch: DashboardPropertyInquiryLeadUpdate,
) {
  const payload: Record<string, string> = {}

  if (patch.status !== undefined) {
    payload.status = patch.status
  }

  if (patch.notes !== undefined) {
    payload.notes = patch.notes
  }

  if (Object.keys(payload).length === 0) {
    return
  }

  const { error } = await supabase.from("property_inquiry_leads").update(payload).eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}
