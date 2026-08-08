import type { Locale } from "@/lib/i18n/types"
import type { PropertyInquiryInput } from "@/lib/property-inquiry/types"
import { INPUT_LIMITS, isValidContactName, isValidEmail } from "@/lib/validation/input"

export function validatePropertyInquiryInput(
  body: unknown,
): { ok: true; value: PropertyInquiryInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Solicitud inválida." }
  }

  const input = body as Partial<PropertyInquiryInput>
  const name = typeof input.name === "string" ? input.name.trim() : ""
  const email = typeof input.email === "string" ? input.email.trim() : ""
  const phone = typeof input.phone === "string" ? input.phone.trim() : ""
  const propertyDetails = typeof input.propertyDetails === "string" ? input.propertyDetails.trim() : ""
  const locale: Locale = input.locale === "en" ? "en" : "es"

  if (!isValidContactName(name)) return { ok: false, error: "El nombre es obligatorio." }
  if (!isValidEmail(email)) return { ok: false, error: "Correo inválido." }
  if (!phone || phone.length > INPUT_LIMITS.phone) return { ok: false, error: "El teléfono es obligatorio." }
  if (!/^\+[1-9]\d{6,14}$/.test(phone.replace(/\s/g, ""))) {
    return { ok: false, error: "Teléfono inválido." }
  }
  if (propertyDetails.length < 10) {
    return { ok: false, error: "Cuéntanos un poco más sobre tu propiedad." }
  }
  if (propertyDetails.length > INPUT_LIMITS.propertyDetails) {
    return { ok: false, error: "La descripción es demasiado larga." }
  }

  return {
    ok: true,
    value: { name, email, phone, propertyDetails, locale },
  }
}
