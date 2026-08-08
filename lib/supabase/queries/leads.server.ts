import "server-only"

import { env } from "@/lib/config/env"
import { sendPreReservationAdminEmail } from "@/lib/pre-reservation/send-admin-notification"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { PreReservationLeadInput } from "@/lib/properties/types"

async function resolvePropertyNames(propertyIds: string[]): Promise<string[]> {
  if (propertyIds.length === 0) return []

  if (env.dataProvider !== "supabase") {
    return propertyIds
  }

  try {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase.from("properties").select("id, name").in("id", propertyIds)

    if (error || !data) {
      return propertyIds
    }

    return propertyIds.map((id) => data.find((row) => row.id === id)?.name ?? id)
  } catch {
    return propertyIds
  }
}

export async function insertPreReservationLead(
  input: PreReservationLeadInput,
): Promise<{ ok: true; id: string; emailSent: boolean } | { ok: false; error: string }> {
  try {
    let leadId = `local-${Date.now()}`

    if (env.dataProvider === "supabase") {
      const supabase = await getSupabaseServerClient()

      const { data, error } = await supabase
        .from("pre_reservation_leads")
        .insert({
          name: input.name.trim(),
          email: input.email.trim(),
          phone: input.phone.trim(),
          guests: input.guests,
          property_ids: input.propertyIds,
          check_in: input.checkIn,
          check_out: input.checkOut,
          locale: input.locale,
        })
        .select("id")
        .single()

      if (error) {
        return { ok: false, error: error.message }
      }

      leadId = data.id
    }

    const propertyNames = await resolvePropertyNames(input.propertyIds)
    const emailResult = await sendPreReservationAdminEmail({
      ...input,
      leadId,
      propertyNames,
    })

    if (!emailResult.ok) {
      console.error("[insertPreReservationLead] email failed:", emailResult.error)
    }

    return { ok: true, id: leadId, emailSent: emailResult.ok }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo enviar la pre-reserva.",
    }
  }
}
