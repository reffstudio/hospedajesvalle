import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  DashboardPreReservationLead,
  DashboardPreReservationLeadUpdate,
  PreReservationLeadStatus,
} from "@/lib/dashboard/lead-types"
import { PRE_RESERVATION_LEAD_STATUSES } from "@/lib/dashboard/lead-types"
import type { PreReservationLeadRow } from "@/lib/supabase/database.types"

function parsePropertyIds(value: PreReservationLeadRow["property_ids"]): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((id): id is string => typeof id === "string" && id.length > 0)
}

function parseLeadStatus(value: string): PreReservationLeadStatus {
  if (PRE_RESERVATION_LEAD_STATUSES.includes(value as PreReservationLeadStatus)) {
    return value as PreReservationLeadStatus
  }
  return "new"
}

export function mapLeadRowToDashboard(row: PreReservationLeadRow): DashboardPreReservationLead {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    guests: row.guests,
    propertyIds: parsePropertyIds(row.property_ids),
    checkIn: row.check_in,
    checkOut: row.check_out,
    locale: row.locale,
    status: parseLeadStatus(row.status ?? "new"),
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  }
}

export async function listDashboardLeads(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("pre_reservation_leads")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapLeadRowToDashboard(row as PreReservationLeadRow))
}

export async function updateDashboardLead(
  supabase: SupabaseClient,
  id: string,
  patch: DashboardPreReservationLeadUpdate,
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

  const { error } = await supabase.from("pre_reservation_leads").update(payload).eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}
