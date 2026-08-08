"use client"

import { useEffect, useState } from "react"
import { env } from "@/lib/config/env"
import {
  ensurePublicProperties,
  prefetchPublicProperties,
  readPublicPropertiesCache,
} from "@/lib/properties/public-properties-cache"
import type { PublicProperty } from "@/lib/properties/types"
import type { Locale } from "@/lib/i18n/types"

function getInitialProperties(locale: Locale, featuredOnly: boolean): PublicProperty[] {
  const cached = readPublicPropertiesCache(locale)
  if (!cached) return []
  return featuredOnly ? cached.featured : cached.all
}

export function usePublishedProperties(locale: Locale) {
  const [properties, setProperties] = useState<PublicProperty[]>(() => getInitialProperties(locale, false))
  const [isLoading, setIsLoading] = useState(
    () => env.dataProvider === "supabase" && getInitialProperties(locale, false).length === 0,
  )

  useEffect(() => {
    const cached = readPublicPropertiesCache(locale)
    if (cached) {
      setProperties(cached.all)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    void ensurePublicProperties(locale)
      .then((entry) => {
        if (!cancelled) setProperties(entry.all)
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
  const [properties, setProperties] = useState<PublicProperty[]>(() => getInitialProperties(locale, true))
  const [isLoading, setIsLoading] = useState(
    () => env.dataProvider === "supabase" && getInitialProperties(locale, true).length === 0,
  )

  useEffect(() => {
    const cached = readPublicPropertiesCache(locale)
    if (cached) {
      setProperties(cached.featured)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    void ensurePublicProperties(locale)
      .then((entry) => {
        if (!cancelled) setProperties(entry.featured)
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

export { prefetchPublicProperties }
