"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { defaultLocale, type Locale } from "@/lib/i18n/types"
import { getTranslation, interpolate } from "@/lib/i18n/translations"

const STORAGE_KEY = "hv-locale"

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: ReturnType<typeof getTranslation>
  tf: (template: string, vars: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored === "es" || stored === "en") {
      setLocaleState(stored)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.lang = locale
    localStorage.setItem(STORAGE_KEY, locale)
  }, [locale, mounted])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
  }, [])

  const t = useMemo(() => getTranslation(locale), [locale])
  const tf = useCallback((template: string, vars: Record<string, string | number>) => interpolate(template, vars), [])

  const value = useMemo(() => ({ locale, setLocale, t, tf }), [locale, setLocale, t, tf])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return ctx
}
