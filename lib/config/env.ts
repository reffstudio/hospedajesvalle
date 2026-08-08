/**
 * Typed environment configuration.
 * Supabase vars are optional until the backend is connected.
 */

export type DataProvider = "static" | "supabase"

function readDataProvider(): DataProvider {
  const value = process.env.NEXT_PUBLIC_DATA_PROVIDER
  if (value === "supabase") return "supabase"
  return "static"
}

export const env = {
  dataProvider: readDataProvider(),

  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  },

  storage: {
    propertyImagesBucket:
      process.env.NEXT_PUBLIC_SUPABASE_PROPERTY_IMAGES_BUCKET ?? "property-images",
  },

  email: {
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    adminTo: process.env.PRE_RESERVATION_ADMIN_EMAIL ?? "",
    from: process.env.PRE_RESERVATION_FROM_EMAIL ?? "Hospedajes Valle <onboarding@resend.dev>",
  },
} as const

export function isPreReservationEmailConfigured(): boolean {
  return Boolean(env.email.resendApiKey && env.email.adminTo)
}

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabase.url && env.supabase.anonKey)
}

export function assertSupabaseConfigured(context: string): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      `[${context}] Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.`,
    )
  }
}
