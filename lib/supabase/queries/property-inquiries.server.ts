import "server-only"

import { env } from "@/lib/config/env"
import { sendPropertyInquiryAdminEmail } from "@/lib/property-inquiry/send-admin-notification"
import type { PropertyInquiryInput } from "@/lib/property-inquiry/types"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function insertPropertyInquiryLead(
  input: PropertyInquiryInput,
): Promise<{ ok: true; id: string; emailSent: boolean } | { ok: false; error: string }> {
  try {
    let leadId = `local-${Date.now()}`

    if (env.dataProvider === "supabase") {
      const supabase = await getSupabaseServerClient()

      const { data, error } = await supabase
        .from("property_inquiry_leads")
        .insert({
          name: input.name.trim(),
          email: input.email.trim(),
          phone: input.phone.trim(),
          property_details: input.propertyDetails.trim(),
          locale: input.locale,
        })
        .select("id")
        .single()

      if (error) {
        return { ok: false, error: error.message }
      }

      leadId = data.id
    }

    const emailResult = await sendPropertyInquiryAdminEmail({
      ...input,
      leadId,
    })

    if (!emailResult.ok) {
      console.error("[insertPropertyInquiryLead] email failed:", emailResult.error)
    }

    return { ok: true, id: leadId, emailSent: emailResult.ok }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo enviar la solicitud.",
    }
  }
}
