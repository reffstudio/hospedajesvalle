import type { PropertyInquiryInput } from "@/lib/property-inquiry/types"

export type PropertyInquiryEmailPayload = PropertyInquiryInput & {
  leadId: string
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

import { sanitizeHeaderValue } from "@/lib/validation/input"

export function buildPropertyInquiryEmailSubject(payload: PropertyInquiryEmailPayload) {
  return `[Hospedajes Valle] Nueva propiedad — ${sanitizeHeaderValue(payload.name)}`
}

export function buildPropertyInquiryEmailText(payload: PropertyInquiryEmailPayload) {
  return [
    "Hospedajes Valle — Nueva solicitud de administración de propiedad",
    "",
    "PROPIETARIO",
    `Nombre: ${payload.name}`,
    `Correo: ${payload.email}`,
    `Teléfono: ${payload.phone}`,
    "",
    "DETALLES DE LA PROPIEDAD",
    payload.propertyDetails,
    "",
    `Referencia: ${payload.leadId}`,
    `Recibido: ${formatReceivedAt()}`,
    "",
    `Responder a: ${payload.email}`,
  ].join("\n")
}

export function buildPropertyInquiryEmailHtml(payload: PropertyInquiryEmailPayload) {
  const details = escapeHtml(payload.propertyDetails).replace(/\n/g, "<br />")

  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:24px;background:#f6f7f2;font-family:Georgia,serif;color:#1e2f28;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #d8dcc8;border-radius:16px;padding:28px;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#742238;">Nueva propiedad</p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;">${escapeHtml(payload.name)}</h1>
    <p style="margin:0 0 6px;"><strong>Correo:</strong> <a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></p>
    <p style="margin:0 0 20px;"><strong>Teléfono:</strong> <a href="tel:${escapeHtml(payload.phone)}">${escapeHtml(payload.phone)}</a></p>
    <h2 style="margin:0 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;color:#324f43;">Detalles</h2>
    <p style="margin:0 0 24px;line-height:1.6;white-space:normal;">${details}</p>
    <p style="margin:0;font-size:12px;color:#666;">Ref. ${escapeHtml(payload.leadId)} · ${escapeHtml(formatReceivedAt())}</p>
  </div>
</body>
</html>`
}
