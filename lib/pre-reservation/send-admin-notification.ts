import "server-only"

import { Resend } from "resend"
import { env, isPreReservationEmailConfigured } from "@/lib/config/env"
import {
  buildPreReservationEmailHtml,
  buildPreReservationEmailSubject,
  buildPreReservationEmailText,
  type PreReservationEmailPayload,
} from "@/lib/pre-reservation/format-lead-email"

export async function sendPreReservationAdminEmail(
  payload: PreReservationEmailPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isPreReservationEmailConfigured()) {
    console.warn("[sendPreReservationAdminEmail] Email not configured — lead saved but not emailed.")
    return { ok: false, error: "Email notifications are not configured." }
  }

  try {
    const resend = new Resend(env.email.resendApiKey)

    const { data, error } = await resend.emails.send({
      from: env.email.from,
      to: [env.email.adminTo],
      replyTo: payload.email,
      subject: buildPreReservationEmailSubject(payload),
      text: buildPreReservationEmailText(payload),
      html: buildPreReservationEmailHtml(payload),
      headers: {
        "X-Entity-Ref-ID": payload.leadId,
      },
      tags: [{ name: "category", value: "pre-reservation" }],
    })

    if (error) {
      console.error("[sendPreReservationAdminEmail]", error.message)
      return { ok: false, error: "No se pudo enviar la notificación." }
    }

    return { ok: true }
  } catch (error) {
    console.error("[sendPreReservationAdminEmail]", error instanceof Error ? error.message : error)
    return { ok: false, error: "No se pudo enviar la notificación." }
  }
}
