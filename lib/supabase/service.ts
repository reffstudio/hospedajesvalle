import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"
import { env, assertSupabaseConfigured } from "@/lib/config/env"

let serviceClient: ReturnType<typeof createClient<Database>> | null = null

/** Server-only Supabase client with service role — never import in client components. */
export function getSupabaseServiceClient() {
  assertSupabaseConfigured("getSupabaseServiceClient")

  if (!env.supabase.serviceRoleKey) {
    throw new Error(
      "[getSupabaseServiceClient] SUPABASE_SERVICE_ROLE_KEY is required for server-side admin operations.",
    )
  }

  if (!serviceClient) {
    serviceClient = createClient<Database>(env.supabase.url, env.supabase.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return serviceClient
}
