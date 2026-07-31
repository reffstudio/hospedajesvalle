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

import { DASHBOARD_AUTH_KEY } from "@/lib/data/storage-keys"

const AUTH_KEY = DASHBOARD_AUTH_KEY

type DashboardAuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  email: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const DashboardAuthContext = createContext<DashboardAuthContextValue | null>(null)

export function DashboardAuthProvider({ children }: { children: ReactNode }) {
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

  const login = useCallback(async (nextEmail: string, _password: string) => {
    const normalized = nextEmail.trim().toLowerCase()
    if (!normalized.includes("@")) return false

    window.sessionStorage.setItem(AUTH_KEY, normalized)
    setEmail(normalized)
    setIsAuthenticated(true)
    return true
  }, [])

  const logout = useCallback(() => {
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

export function useDashboardAuth() {
  const context = useContext(DashboardAuthContext)
  if (!context) {
    throw new Error("useDashboardAuth must be used within DashboardAuthProvider")
  }
  return context
}
