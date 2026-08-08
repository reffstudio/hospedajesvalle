import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"
import { env, assertSupabaseConfigured } from "@/lib/config/env"

let anonServerClient: SupabaseClient<Database> | null = null

/**
 * Server-side anon client without auth cookies.
 * Use for public form submissions from API routes so RLS applies as anon, not dashboard session.
 */
export function getSupabaseAnonServerClient(): SupabaseClient<Database> {
  assertSupabaseConfigured("getSupabaseAnonServerClient")

  if (!anonServerClient) {
    anonServerClient = createClient<Database>(env.supabase.url, env.supabase.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return anonServerClient
}
