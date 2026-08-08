"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDashboardAuth } from "./dashboard-auth-provider"

export function DashboardLoginForm() {
  const router = useRouter()
  const { login } = useDashboardAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const result = await login(email, password)
    setIsSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    router.replace("/dashboard/properties")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f6f7f2_0%,#eceee4_100%)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-valle-sage-200/90 bg-white p-6 shadow-[0_20px_60px_rgba(24,40,32,0.08)] sm:p-8">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-valle-forest-500">
            Hospedajes Valle
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-valle-forest-900">Panel de administración</h1>
          <p className="mt-2 text-sm text-valle-forest-600">
            Gestiona propiedades, destacadas, amenidades y visibilidad del catálogo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-valle-forest-700">Correo</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="dashboard-input"
              placeholder="admin@hospedajesvalle.com"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-valle-forest-700">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="dashboard-input"
              placeholder="••••••••"
            />
          </label>

          {error ? <p className="text-sm text-valle-wine-700">{error}</p> : null}

          <button type="submit" disabled={isSubmitting} className="dashboard-btn-primary w-full">
            {isSubmitting ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-valle-forest-500">
          Acceso protegido con Supabase Auth. Usa el correo y contraseña del usuario admin que creaste en el panel de
          Supabase.
        </p>

        <p className="mt-4 text-center">
          <Link href="/" className="text-xs font-medium text-valle-forest-700 underline-offset-2 hover:underline">
            Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  )
}
