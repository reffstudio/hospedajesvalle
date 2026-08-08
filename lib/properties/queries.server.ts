import "server-only"

import { env } from "@/lib/config/env"
import type { PublicPropertyQueryOptions } from "@/lib/properties/types"
import { getPublicPropertiesSync } from "@/lib/properties/queries"
import { fetchPublicPropertiesFromSupabase } from "@/lib/supabase/queries/properties.server"

export async function getPublicProperties(options: PublicPropertyQueryOptions) {
  if (env.dataProvider === "static") {
    return getPublicPropertiesSync(options)
  }

  return fetchPublicPropertiesFromSupabase(options)
}
