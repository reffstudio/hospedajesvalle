import type { Locale } from "@/lib/i18n/types"
import type { PreReservationLeadInput } from "@/lib/properties/types"

export type PreReservationEmailPayload = PreReservationLeadInput & {
  leadId: string
  propertyNames: string[]
}

/** Brand tokens — mirror app/globals.css Valle palette */
const BRAND = {
  sage50: "#f6f7f2",
  sage200: "#d8dcc8",
  forest600: "#324f43",
  forest900: "#1e2f28",
  wine700: "#742238",
  white: "#ffffff",
} as const

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hospedajesvalle.com"

function countNights(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T12:00:00`)
  const end = new Date(`${checkOut}T12:00:00`)
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

function formatDate(value: string, locale: Locale) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(locale === "en" ? "en-US" : "es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatReceivedAt() {
  return new Date().toLocaleString("es-MX", {
    timeZone: "America/Tijuana",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function buildPreReservationEmailSubject(payload: PreReservationEmailPayload) {
  const properties =
    payload.propertyNames.length > 0 ? payload.propertyNames.join(", ") : `${payload.propertyIds.length} propiedad(es)`
  return `[Hospedajes Valle] Nueva pre-reserva — ${payload.name} · ${properties}`
}

export function buildPreReservationEmailText(payload: PreReservationEmailPayload) {
  const nights = countNights(payload.checkIn, payload.checkOut)
  const propertiesBlock =
    payload.propertyNames.length > 0
      ? payload.propertyNames.map((name, index) => `  ${index + 1}. ${name}`).join("\n")
      : payload.propertyIds.map((id, index) => `  ${index + 1}. ${id}`).join("\n")

  return [
    "Hospedajes Valle — Nueva solicitud de pre-reserva",
    "",
    "HUÉSPED",
    `Nombre: ${payload.name}`,
    `Correo: ${payload.email}`,
    `Teléfono: ${payload.phone}`,
    `Huéspedes: ${payload.guests}`,
    "",
    "PROPIEDADES DE INTERÉS",
    propertiesBlock,
    "",
    "FECHAS",
    `Entrada: ${formatDate(payload.checkIn, payload.locale)}`,
    `Salida: ${formatDate(payload.checkOut, payload.locale)}`,
    `Noches: ${nights}`,
    "",
    `Referencia: ${payload.leadId}`,
    `Recibido: ${formatReceivedAt()}`,
    "",
    SITE_URL,
  ].join("\n")
}

function section(title: string, bodyHtml: string) {
  return `
    <div style="margin-bottom: 20px;">
      <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${BRAND.forest600};">${title}</p>
      ${bodyHtml}
    </div>
  `
}

function line(label: string, valueHtml: string) {
  return `<p style="margin: 0 0 6px; font-size: 15px; line-height: 1.5; color: ${BRAND.forest900};"><strong>${label}:</strong> ${valueHtml}</p>`
}

export function buildPreReservationEmailHtml(payload: PreReservationEmailPayload) {
  const nights = countNights(payload.checkIn, payload.checkOut)
  const propertyItems =
    payload.propertyNames.length > 0 ? payload.propertyNames : payload.propertyIds

  const propertiesHtml = propertyItems
    .map((name) => `<li style="margin-bottom: 4px;">${escapeHtml(name)}</li>`)
    .join("")

  const guestSection = section(
    "Huésped",
    [
      line("Nombre", escapeHtml(payload.name)),
      line(
        "Correo",
        `<a href="mailto:${escapeHtml(payload.email)}" style="color: ${BRAND.wine700};">${escapeHtml(payload.email)}</a>`,
      ),
      line(
        "Teléfono",
        `<a href="tel:${escapeHtml(payload.phone)}" style="color: ${BRAND.wine700};">${escapeHtml(payload.phone)}</a>`,
      ),
      line("Huéspedes", String(payload.guests)),
    ].join(""),
  )

  const propertiesSection = section(
    "Propiedades de interés",
    `<ul style="margin: 0; padding-left: 20px; color: ${BRAND.forest900}; font-size: 15px; line-height: 1.5;">${propertiesHtml}</ul>`,
  )

  const datesSection = section(
    "Fechas de estancia",
    [
      line("Entrada", escapeHtml(formatDate(payload.checkIn, payload.locale))),
      line("Salida", escapeHtml(formatDate(payload.checkOut, payload.locale))),
      line("Noches", `<strong>${nights}</strong>`),
    ].join(""),
  )

  return `
<!DOCTYPE html>
<html lang="${payload.locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nueva pre-reserva — Hospedajes Valle</title>
  </head>
  <body style="margin: 0; padding: 24px 16px; background-color: ${BRAND.sage50}; font-family: Georgia, 'Times New Roman', Times, serif; color: ${BRAND.forest900};">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
      Solicitud de ${escapeHtml(payload.name)} · ${propertyItems.length} propiedad(es) · ${nights} noche(s)
    </div>
    <div style="max-width: 560px; margin: 0 auto; background-color: ${BRAND.white}; border: 1px solid ${BRAND.sage200}; padding: 28px 24px;">
      <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${BRAND.forest600};">Hospedajes Valle</p>
      <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 600; line-height: 1.3; color: ${BRAND.forest900};">Nueva solicitud de pre-reserva</h1>
      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: ${BRAND.forest600};">
        Un huésped completó el formulario en el sitio. Responde directamente a su correo para confirmar disponibilidad.
      </p>
      ${guestSection}
      ${propertiesSection}
      ${datesSection}
      <p style="margin: 24px 0 0; padding-top: 16px; border-top: 1px solid ${BRAND.sage200}; font-size: 12px; line-height: 1.5; color: ${BRAND.forest600};">
        Referencia ${escapeHtml(payload.leadId)} · ${escapeHtml(formatReceivedAt())}
      </p>
    </div>
  </body>
</html>
  `.trim()
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
