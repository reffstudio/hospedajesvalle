export const INPUT_LIMITS = {
  name: 120,
  email: 254,
  phone: 20,
  propertyDetails: 4000,
  maxPropertyIds: 12,
} as const

export function sanitizeHeaderValue(value: string) {
  return value.replace(/[\r\n\u0000-\u001F\u007F]/g, "").trim()
}

export function isValidEmail(email: string) {
  if (!email || email.length > INPUT_LIMITS.email) return false
  if (/[\r\n\u0000-\u001F]/.test(email)) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidContactName(name: string) {
  return name.length > 0 && name.length <= INPUT_LIMITS.name
}
