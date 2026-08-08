import type { Locale } from "@/lib/i18n/types"
import type { PreReservationLeadInput } from "@/lib/properties/types"
import { INPUT_LIMITS, isValidContactName, isValidEmail } from "@/lib/validation/input"

export function validatePreReservationLeadInput(
  body: unknown,
): { ok: true; value: PreReservationLeadInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Solicitud inválida." }
  }

  const input = body as Partial<PreReservationLeadInput>
  const name = typeof input.name === "string" ? input.name.trim() : ""
  const email = typeof input.email === "string" ? input.email.trim() : ""
  const phone = typeof input.phone === "string" ? input.phone.trim() : ""
  const guests = typeof input.guests === "number" ? input.guests : Number(input.guests)
  const propertyIds = Array.isArray(input.propertyIds)
    ? input.propertyIds
        .filter((id): id is string => typeof id === "string" && id.length > 0)
        .slice(0, INPUT_LIMITS.maxPropertyIds)
    : []
  const checkIn = typeof input.checkIn === "string" ? input.checkIn : ""
  const checkOut = typeof input.checkOut === "string" ? input.checkOut : ""
  const locale: Locale = input.locale === "en" ? "en" : "es"

  if (!isValidContactName(name)) return { ok: false, error: "El nombre es obligatorio." }
  if (!isValidEmail(email)) return { ok: false, error: "Correo inválido." }
  if (!phone || phone.length > INPUT_LIMITS.phone) return { ok: false, error: "El teléfono es obligatorio." }
  if (!/^\+[1-9]\d{6,14}$/.test(phone.replace(/\s/g, ""))) {
    return { ok: false, error: "Teléfono inválido." }
  }
  if (!Number.isFinite(guests) || guests < 1 || guests > 30) {
    return { ok: false, error: "Número de huéspedes inválido." }
  }
  if (propertyIds.length === 0) return { ok: false, error: "Selecciona al menos una propiedad." }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return { ok: false, error: "Fechas inválidas." }
  }
  if (checkOut <= checkIn) return { ok: false, error: "La salida debe ser posterior a la entrada." }

  return {
    ok: true,
    value: { name, email, phone, guests, propertyIds, checkIn, checkOut, locale },
  }
}
