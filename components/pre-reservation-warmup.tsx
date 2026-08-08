"use client"

import { useEffect } from "react"
import { useLanguage } from "./language-provider"
import { prefetchPublicProperties } from "@/lib/properties/use-published-properties"

export function PreReservationWarmup() {
  const { locale } = useLanguage()

  useEffect(() => {
    prefetchPublicProperties(locale)
  }, [locale])

  return null
}
