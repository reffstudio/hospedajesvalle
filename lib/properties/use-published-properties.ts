"use client"

import { useEffect, useState } from "react"
import { env } from "@/lib/config/env"
import { getFeaturedCarouselProperties, getPublishedProperties } from "@/lib/properties/queries"
import { hydratePublicProperties } from "@/lib/properties/hydrate-public-property"
import type { PublicProperty } from "@/lib/properties/types"
import type { Locale } from "@/lib/i18n/types"

async function fetchPropertiesFromApi(locale: Locale, featuredOnly = false) {
  const params = new URLSearchParams({
    locale,
    featured: String(featuredOnly),
  })
  const response = await fetch(`/api/properties?${params.toString()}`)
  if (!response.ok) {
    throw new Error("No se pudieron cargar las propiedades.")
  }
  const payload = (await response.json()) as { properties: PublicProperty[] }
  return payload.properties
}

export function usePublishedProperties(locale: Locale) {
  const [properties, setProperties] = useState<PublicProperty[]>(() =>
    env.dataProvider === "supabase" ? [] : getPublishedProperties(locale),
  )
  const [isLoading, setIsLoading] = useState(env.dataProvider === "supabase")

  useEffect(() => {
    if (env.dataProvider !== "supabase") {
      setProperties(getPublishedProperties(locale))
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    void fetchPropertiesFromApi(locale)
      .then((next) => {
        if (!cancelled) setProperties(hydratePublicProperties(next, locale))
      })
      .catch((error) => {
        console.error("[usePublishedProperties]", error)
        if (!cancelled) setProperties([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [locale])

  return { properties, isLoading }
}

export function useFeaturedCarouselProperties(locale: Locale) {
  const [properties, setProperties] = useState<PublicProperty[]>(() =>
    env.dataProvider === "supabase" ? [] : getFeaturedCarouselProperties(locale),
  )
  const [isLoading, setIsLoading] = useState(env.dataProvider === "supabase")

  useEffect(() => {
    if (env.dataProvider !== "supabase") {
      setProperties(getFeaturedCarouselProperties(locale))
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    void fetchPropertiesFromApi(locale, true)
      .then((next) => {
        if (!cancelled) setProperties(hydratePublicProperties(next, locale))
      })
      .catch((error) => {
        console.error("[useFeaturedCarouselProperties]", error)
        if (!cancelled) setProperties([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [locale])

  return { properties, isLoading }
}
