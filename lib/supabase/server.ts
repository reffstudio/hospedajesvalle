import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { env, assertSupabaseConfigured } from "@/lib/config/env"

/**
 * Server Supabase client for RSC, Route Handlers, and middleware.
 * Requires @supabase/ssr and @supabase/supabase-js when connecting.
 */
export async function getSupabaseServerClient() {
  assertSupabaseConfigured("getSupabaseServerClient")

  const cookieStore = await cookies()

  return createServerClient(env.supabase.url, env.supabase.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // setAll can fail in Server Components; safe to ignore when middleware refreshes sessions.
        }
      },
    },
  })
}
