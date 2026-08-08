"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
  Users,
} from "lucide-react"
import {
  PRE_RESERVATION_LEAD_STATUSES,
  PRE_RESERVATION_STATUS_FILTER_LABELS,
  PRE_RESERVATION_STATUS_FILTERS,
  PRE_RESERVATION_STATUS_LABELS,
  PRE_RESERVATION_STATUS_STYLES,
  type DashboardPreReservationLead,
  type PreReservationStatusFilter,
} from "@/lib/dashboard/lead-types"
import { useLeadStore } from "@/lib/dashboard/lead-store"
import { usePropertyStore } from "@/lib/dashboard/property-store"
import { cn } from "@/lib/utils"

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`)
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
}

function formatDateTime(value: string) {
  const date = new Date(value)
  return date.toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function nightsBetween(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T12:00:00`)
  const end = new Date(`${checkOut}T12:00:00`)
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

function LeadNotesPanel({
  lead,
  onSaveNotes,
  isSyncing,
}: {
  lead: DashboardPreReservationLead
  onSaveNotes: (notes: string) => Promise<void>
  isSyncing: boolean
}) {
  const [notes, setNotes] = useState(lead.notes)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setNotes(lead.notes)
  }, [lead.id, lead.notes])

  const handleSave = async () => {
    await onSaveNotes(notes)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3 rounded-2xl border border-valle-sage-200 bg-valle-sage-50/70 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-valle-forest-900">
        <MessageSquareText className="h-4 w-4 text-valle-forest-500" />
        Notas de seguimiento
      </div>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={3}
        placeholder="Ej. Llamé al cliente, espera confirmación de fechas, pidió cotización..."
        className="w-full rounded-xl border border-valle-sage-200 bg-white px-3 py-2.5 text-sm text-valle-forest-900 placeholder-neutral-400 focus:border-valle-wine-600 focus:outline-none focus:ring-2 focus:ring-valle-wine-600/20"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-valle-forest-500">
          Actualizado: {formatDateTime(lead.updatedAt)}
        </p>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSyncing || notes === lead.notes}
          className="dashboard-btn-secondary disabled:opacity-50"
        >
          {saved ? "Guardado" : "Guardar notas"}
        </button>
      </div>
    </div>
  )
}

function LeadRow({
  lead,
  propertyNames,
  isSyncing,
  onStatusChange,
  onSaveNotes,
}: {
  lead: DashboardPreReservationLead
  propertyNames: string[]
  isSyncing: boolean
  onStatusChange: (status: DashboardPreReservationLead["status"]) => Promise<void>
  onSaveNotes: (notes: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const nights = nightsBetween(lead.checkIn, lead.checkOut)

  return (
    <>
      <tr className="border-b border-valle-sage-100 last:border-0">
        <td className="px-3 py-4 align-top">
          <div className="space-y-1">
            <p className="font-medium text-valle-forest-900">{lead.name}</p>
            <p className="text-xs text-valle-forest-500">Recibida {formatDateTime(lead.createdAt)}</p>
            {lead.notes ? (
              <p className="line-clamp-2 text-xs text-valle-forest-600">{lead.notes}</p>
            ) : null}
          </div>
        </td>
        <td className="px-3 py-4 align-top">
          <div className="space-y-1.5 text-sm">
            <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-valle-forest-800 hover:text-valle-wine-700">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="break-all">{lead.email}</span>
            </a>
            <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-valle-forest-800 hover:text-valle-wine-700">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {lead.phone}
            </a>
          </div>
        </td>
        <td className="px-3 py-4 align-top">
          <div className="space-y-1 text-sm text-valle-forest-800">
            <p className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-valle-forest-500" />
              {lead.guests} {lead.guests === 1 ? "huésped" : "huéspedes"}
            </p>
            <p className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-valle-forest-500" />
              {formatDate(lead.checkIn)} → {formatDate(lead.checkOut)}
            </p>
            <p className="text-xs text-valle-forest-500">
              {nights} {nights === 1 ? "noche" : "noches"} · {lead.locale.toUpperCase()}
            </p>
          </div>
        </td>
        <td className="px-3 py-4 align-top">
          <ul className="space-y-1 text-sm text-valle-forest-800">
            {propertyNames.map((name, index) => (
              <li key={`${lead.propertyIds[index] ?? name}-${index}`}>{name}</li>
            ))}
          </ul>
        </td>
        <td className="px-3 py-4 align-top">
          <select
            value={lead.status}
            onChange={(event) => void onStatusChange(event.target.value as DashboardPreReservationLead["status"])}
            disabled={isSyncing}
            className={cn(
              "w-full min-w-[9rem] cursor-pointer rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ring-1 focus:outline-none focus:ring-2 focus:ring-valle-wine-600/20",
              PRE_RESERVATION_STATUS_STYLES[lead.status],
            )}
          >
            {PRE_RESERVATION_LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PRE_RESERVATION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </td>
        <td className="px-3 py-4 align-top">
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="dashboard-icon-btn"
            aria-expanded={expanded}
            aria-label={expanded ? "Ocultar detalle" : "Ver detalle y notas"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </td>
      </tr>
      {expanded ? (
        <tr className="border-b border-valle-sage-100 bg-valle-cream-50/60">
          <td colSpan={6} className="px-3 py-4">
            <LeadNotesPanel lead={lead} onSaveNotes={onSaveNotes} isSyncing={isSyncing} />
          </td>
        </tr>
      ) : null}
    </>
  )
}

export function PreReservationListPage() {
  const { leads, isReady, isSyncing, error, updateLead, refresh } = useLeadStore()
  const { properties } = usePropertyStore()
  const [filter, setFilter] = useState<PreReservationStatusFilter>("all")

  const propertyNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const property of properties) {
      map.set(property.id, property.name)
    }
    return map
  }, [properties])

  const counts = useMemo(() => {
    const result: Record<PreReservationStatusFilter, number> = {
      all: leads.length,
      new: 0,
      contacted: 0,
      scheduled: 0,
      rejected: 0,
      archived: 0,
    }

    for (const lead of leads) {
      result[lead.status] += 1
    }

    return result
  }, [leads])

  const filtered = useMemo(() => {
    if (filter === "all") return leads
    return leads.filter((lead) => lead.status === filter)
  }, [leads, filter])

  if (!isReady) {
    return <p className="text-sm text-valle-forest-600">Cargando pre-reservas...</p>
  }

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-xl border border-valle-wine-200 bg-valle-wine-50 px-4 py-3 text-sm text-valle-wine-800">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-valle-forest-500">
            Solicitudes
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-valle-forest-900 sm:text-3xl">
            Pre-reservas
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-valle-forest-600">
            Da seguimiento a cada solicitud: contacto con el cliente, confirmación de fechas, reservas
            agendadas y solicitudes rechazadas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={isSyncing}
          className="dashboard-btn-secondary inline-flex items-center gap-2 self-start"
        >
          <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
          Actualizar
        </button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {PRE_RESERVATION_LEAD_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={cn(
              "rounded-2xl border px-4 py-4 text-left transition-colors",
              filter === status
                ? "border-valle-forest-900 bg-valle-forest-900 text-white"
                : "border-valle-sage-200 bg-white hover:bg-valle-sage-50",
            )}
          >
            <p
              className={cn(
                "text-[10px] font-semibold uppercase tracking-[0.14em]",
                filter === status ? "text-white/70" : "text-valle-forest-500",
              )}
            >
              {PRE_RESERVATION_STATUS_LABELS[status]}
            </p>
            <p className="mt-1 text-2xl font-semibold">{counts[status]}</p>
          </button>
        ))}
      </section>

      <section className="dashboard-panel">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-valle-forest-900">Listado</h2>
            <p className="mt-1 text-sm text-valle-forest-600">
              {filtered.length} {filtered.length === 1 ? "solicitud" : "solicitudes"}
              {filter !== "all" ? ` · ${PRE_RESERVATION_STATUS_LABELS[filter]}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRE_RESERVATION_STATUS_FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                  filter === option
                    ? "bg-valle-forest-900 text-white"
                    : "bg-white text-valle-forest-700 ring-1 ring-valle-sage-200 hover:bg-valle-sage-50",
                )}
              >
                {PRE_RESERVATION_STATUS_FILTER_LABELS[option]} ({counts[option]})
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-valle-sage-200 text-[11px] uppercase tracking-[0.14em] text-valle-forest-500">
                  <th className="px-3 py-3 font-semibold">Cliente</th>
                  <th className="px-3 py-3 font-semibold">Contacto</th>
                  <th className="px-3 py-3 font-semibold">Estancia</th>
                  <th className="px-3 py-3 font-semibold">Propiedades</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                  <th className="px-3 py-3 font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    propertyNames={lead.propertyIds.map((id) => propertyNameById.get(id) ?? id)}
                    isSyncing={isSyncing}
                    onStatusChange={(status) => updateLead(lead.id, { status })}
                    onSaveNotes={(notes) => updateLead(lead.id, { notes })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-valle-sage-300 px-4 py-8 text-center text-sm text-valle-forest-500">
            {leads.length === 0
              ? "Aún no hay pre-reservas. Cuando un visitante envíe una solicitud desde el sitio, aparecerá aquí."
              : "No hay solicitudes con este filtro."}
          </p>
        )}
      </section>
    </div>
  )
}
