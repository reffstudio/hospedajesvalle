import "server-only"

import { Resend } from "resend"
import { env, isPreReservationEmailConfigured } from "@/lib/config/env"
import {
  buildPropertyInquiryEmailHtml,
  buildPropertyInquiryEmailSubject,
  buildPropertyInquiryEmailText,
  type PropertyInquiryEmailPayload,
} from "@/lib/property-inquiry/format-lead-email"

export async function sendPropertyInquiryAdminEmail(
  payload: PropertyInquiryEmailPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isPreReservationEmailConfigured()) {
    console.warn("[sendPropertyInquiryAdminEmail] Email not configured — inquiry saved but not emailed.")
    return { ok: false, error: "Email notifications are not configured." }
  }

  try {
    const resend = new Resend(env.email.resendApiKey)

    const { data, error } = await resend.emails.send({
      from: env.email.from,
      to: [env.email.adminTo],
      replyTo: payload.email,
      subject: buildPropertyInquiryEmailSubject(payload),
      text: buildPropertyInquiryEmailText(payload),
      html: buildPropertyInquiryEmailHtml(payload),
      headers: {
        "X-Entity-Ref-ID": payload.leadId,
      },
      tags: [{ name: "category", value: "property-inquiry" }],
    })

    if (error) {
      console.error("[sendPropertyInquiryAdminEmail]", error.message)
      return { ok: false, error: "No se pudo enviar la notificación." }
    }

    return { ok: true }
  } catch (error) {
    console.error("[sendPropertyInquiryAdminEmail]", error instanceof Error ? error.message : error)
    return { ok: false, error: "No se pudo enviar la notificación." }
  }
}
