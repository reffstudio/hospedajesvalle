"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { env, isSupabaseConfigured } from "@/lib/config/env"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { DASHBOARD_AUTH_KEY } from "@/lib/data/storage-keys"

const AUTH_KEY = DASHBOARD_AUTH_KEY

type DashboardAuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  email: string | null
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => Promise<void>
}

const DashboardAuthContext = createContext<DashboardAuthContextValue | null>(null)

function MockDashboardAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = window.sessionStorage.getItem(AUTH_KEY)
    if (stored) {
      setEmail(stored)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (nextEmail: string, password: string) => {
    const normalized = nextEmail.trim().toLowerCase()
    if (!normalized.includes("@")) {
      return { ok: false as const, error: "Ingresa un correo válido." }
    }

    window.sessionStorage.setItem(AUTH_KEY, normalized)
    setEmail(normalized)
    setIsAuthenticated(true)
    return { ok: true as const }
  }, [])

  const logout = useCallback(async () => {
    window.sessionStorage.removeItem(AUTH_KEY)
    setEmail(null)
    setIsAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, email, login, logout }),
    [isAuthenticated, isLoading, email, login, logout],
  )

  return <DashboardAuthContext.Provider value={value}>{children}</DashboardAuthContext.Provider>
}

function mapSupabaseLoginError(message: string, code?: string): string {
  if (code === "email_not_confirmed") {
    return "Confirma tu correo en Supabase antes de iniciar sesión (Authentication → Users → Confirm user)."
  }
  if (code === "invalid_credentials") {
    return "Correo o contraseña incorrectos."
  }
  if (code === "invalid_api_key") {
    return "Configuración de Supabase inválida. Revisa NEXT_PUBLIC_SUPABASE_URL y la publishable key en .env.local."
  }
  return message || "No se pudo iniciar sesión. Intenta de nuevo."
}

function SupabaseDashboardAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    try {
      const supabase = getSupabaseBrowserClient()

      void supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          if (cancelled) return
          setEmail(session?.user.email ?? null)
          setIsAuthenticated(Boolean(session))
          setIsLoading(false)
        })
        .catch(() => {
          if (cancelled) return
          setIsLoading(false)
        })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (cancelled) return
        setEmail(session?.user.email ?? null)
        setIsAuthenticated(Boolean(session))
        setIsLoading(false)
      })

      return () => {
        cancelled = true
        subscription.unsubscribe()
      }
    } catch {
      setIsLoading(false)
      return undefined
    }
  }, [])

  const login = useCallback(async (nextEmail: string, password: string) => {
    const normalized = nextEmail.trim().toLowerCase()
    if (!normalized.includes("@")) {
      return { ok: false as const, error: "Ingresa un correo válido." }
    }

    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalized,
      password,
    })

    if (error || !data.session) {
      return {
        ok: false as const,
        error: mapSupabaseLoginError(error?.message ?? "", error?.code),
      }
    }

    setEmail(data.session.user.email ?? normalized)
    setIsAuthenticated(true)
    return { ok: true as const }
  }, [])

  const logout = useCallback(async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    setEmail(null)
    setIsAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, email, login, logout }),
    [isAuthenticated, isLoading, email, login, logout],
  )

  return <DashboardAuthContext.Provider value={value}>{children}</DashboardAuthContext.Provider>
}

export function DashboardAuthProvider({ children }: { children: ReactNode }) {
  if (env.dataProvider === "supabase" && isSupabaseConfigured()) {
    return <SupabaseDashboardAuthProvider>{children}</SupabaseDashboardAuthProvider>
  }

  return <MockDashboardAuthProvider>{children}</MockDashboardAuthProvider>
}

export function useDashboardAuth() {
  const context = useContext(DashboardAuthContext)
  if (!context) {
    throw new Error("useDashboardAuth must be used within DashboardAuthProvider")
  }
  return context
}
