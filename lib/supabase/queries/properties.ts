import "server-only"

/**
 * Server-only re-export. Client code must use /api/properties or getPublicProperties() in lib/properties/queries.ts.
 */
export {
  fetchPublicPropertiesFromSupabase,
  fetchPublicPropertyBySlugFromSupabase,
} from "@/lib/supabase/queries/properties.server"
