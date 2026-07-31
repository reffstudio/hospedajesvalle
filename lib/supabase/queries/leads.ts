import type { PreReservationLeadInput } from "@/lib/properties/types"

/**
 * Persists a pre-reservation lead to Supabase.
 * Wire to the `pre_reservation_leads` table (see supabase/schema.sql).
 */
export async function insertPreReservationLead(
  _input: PreReservationLeadInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  return {
    ok: false,
    error: "Supabase lead submission is not implemented yet.",
  }
}
