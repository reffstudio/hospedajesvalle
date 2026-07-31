import { createBrowserClient } from "@supabase/ssr"
import { env, assertSupabaseConfigured } from "@/lib/config/env"

let browserClient: ReturnType<typeof createBrowserClient> | null = null

/**
 * Browser Supabase client for dashboard auth and CRUD.
 * Requires @supabase/ssr and @supabase/supabase-js when connecting.
 */
export function getSupabaseBrowserClient() {
  assertSupabaseConfigured("getSupabaseBrowserClient")

  if (!browserClient) {
    browserClient = createBrowserClient(env.supabase.url, env.supabase.anonKey)
  }

  return browserClient
}

export function resetSupabaseBrowserClientForTests() {
  browserClient = null
}
