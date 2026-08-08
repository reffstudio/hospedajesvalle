import { NextResponse } from "next/server"
import { fetchPublicPropertiesFromSupabase } from "@/lib/supabase/queries/properties.server"
import type { Locale } from "@/lib/i18n/types"
import { env } from "@/lib/config/env"

export async function GET(request: Request) {
  if (env.dataProvider !== "supabase") {
    return NextResponse.json({ error: "Supabase provider is not enabled." }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const locale = (searchParams.get("locale") === "en" ? "en" : "es") as Locale
  const featuredOnly = searchParams.get("featured") === "true"

  try {
    const properties = await fetchPublicPropertiesFromSupabase({ locale, featuredOnly })
    return NextResponse.json({ properties })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load properties."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
