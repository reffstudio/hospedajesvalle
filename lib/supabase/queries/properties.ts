import type { PublicProperty, PublicPropertyQueryOptions } from "@/lib/properties/types"

/**
 * Supabase-backed public property queries.
 * Implement when connecting the backend — schema lives in supabase/schema.sql.
 */
export async function fetchPublicPropertiesFromSupabase(
  _options: PublicPropertyQueryOptions,
): Promise<PublicProperty[]> {
  throw new Error(
    "Supabase property queries are not implemented yet. Set NEXT_PUBLIC_DATA_PROVIDER=static or implement fetchPublicPropertiesFromSupabase.",
  )
}

export async function fetchPublicPropertyBySlugFromSupabase(
  _locale: PublicPropertyQueryOptions["locale"],
  _slug: string,
): Promise<PublicProperty | null> {
  throw new Error("Supabase property queries are not implemented yet.")
}
