import "server-only"

import { randomUUID } from "crypto"
import { env } from "@/lib/config/env"
import { sendPreReservationAdminEmail } from "@/lib/pre-reservation/send-admin-notification"
import { getSupabaseAnonServerClient } from "@/lib/supabase/anon-server"
import type { PreReservationLeadInput } from "@/lib/properties/types"

async function resolvePropertyNames(propertyIds: string[]): Promise<string[]> {
  if (propertyIds.length === 0) return []

  if (env.dataProvider !== "supabase") {
    return propertyIds
  }

  try {
    const supabase = getSupabaseAnonServerClient()
    const { data, error } = await supabase.from("properties").select("id, name").in("id", propertyIds)

    if (error || !data?.length) {
      return propertyIds
    }

    const rows = data as Array<{ id: string; name: string }>
    return propertyIds.map((id) => {
      const row = rows.find((entry) => entry.id === id)
      return row?.name ?? id
    })
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
      leadId = randomUUID()
      const supabase = getSupabaseAnonServerClient()

      const { error } = await supabase.from("pre_reservation_leads").insert({
        id: leadId,
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        guests: input.guests,
        property_ids: input.propertyIds,
        check_in: input.checkIn,
        check_out: input.checkOut,
        locale: input.locale,
      })

      if (error) {
        console.error("[insertPreReservationLead]", error.message)
        return { ok: false, error: "No se pudo registrar la solicitud. Intenta de nuevo." }
      }
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
    console.error("[insertPreReservationLead]", error instanceof Error ? error.message : error)
    return { ok: false, error: "No se pudo registrar la solicitud. Intenta de nuevo." }
  }
}
