"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Home, Mail, MessageSquareText, Phone, RefreshCw } from "lucide-react"
import {
  PROPERTY_INQUIRY_STATUSES,
  PROPERTY_INQUIRY_STATUS_FILTER_LABELS,
  PROPERTY_INQUIRY_STATUS_FILTERS,
  PROPERTY_INQUIRY_STATUS_LABELS,
  PROPERTY_INQUIRY_STATUS_STYLES,
  type DashboardPropertyInquiryLead,
  type PropertyInquiryStatusFilter,
} from "@/lib/dashboard/property-inquiry-types"
import { usePropertyInquiryStore } from "@/lib/dashboard/property-inquiry-store"
import { cn } from "@/lib/utils"

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

function InquiryNotesPanel({
  inquiry,
  onSaveNotes,
  isSyncing,
}: {
  inquiry: DashboardPropertyInquiryLead
  onSaveNotes: (notes: string) => Promise<void>
  isSyncing: boolean
}) {
  const [notes, setNotes] = useState(inquiry.notes)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setNotes(inquiry.notes)
  }, [inquiry.id, inquiry.notes])

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
        placeholder="Ej. Llamé al propietario, agendar visita, enviar propuesta..."
        className="w-full rounded-xl border border-valle-sage-200 bg-white px-3 py-2.5 text-sm text-valle-forest-900 placeholder-neutral-400 focus:border-valle-wine-600 focus:outline-none focus:ring-2 focus:ring-valle-wine-600/20"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-valle-forest-500">Actualizado: {formatDateTime(inquiry.updatedAt)}</p>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSyncing || notes === inquiry.notes}
          className="dashboard-btn-secondary disabled:opacity-50"
        >
          {saved ? "Guardado" : "Guardar notas"}
        </button>
      </div>
    </div>
  )
}

function InquiryRow({
  inquiry,
  isSyncing,
  onStatusChange,
  onSaveNotes,
}: {
  inquiry: DashboardPropertyInquiryLead
  isSyncing: boolean
  onStatusChange: (status: DashboardPropertyInquiryLead["status"]) => Promise<void>
  onSaveNotes: (notes: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr className="border-b border-valle-sage-100 last:border-0">
        <td className="px-3 py-4 align-top">
          <div className="space-y-1">
            <p className="font-medium text-valle-forest-900">{inquiry.name}</p>
            <p className="text-xs text-valle-forest-500">Recibida {formatDateTime(inquiry.createdAt)}</p>
          </div>
        </td>
        <td className="px-3 py-4 align-top">
          <div className="space-y-1.5 text-sm">
            <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1.5 text-valle-forest-800 hover:text-valle-wine-700">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="break-all">{inquiry.email}</span>
            </a>
            <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1.5 text-valle-forest-800 hover:text-valle-wine-700">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {inquiry.phone}
            </a>
          </div>
        </td>
        <td className="px-3 py-4 align-top">
          <p className="line-clamp-4 text-sm leading-relaxed text-valle-forest-800">{inquiry.propertyDetails}</p>
        </td>
        <td className="px-3 py-4 align-top">
          <select
            value={inquiry.status}
            onChange={(event) => void onStatusChange(event.target.value as DashboardPropertyInquiryLead["status"])}
            disabled={isSyncing}
            className={cn(
              "w-full min-w-[9rem] cursor-pointer rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ring-1 focus:outline-none focus:ring-2 focus:ring-valle-wine-600/20",
              PROPERTY_INQUIRY_STATUS_STYLES[inquiry.status],
            )}
          >
            {PROPERTY_INQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PROPERTY_INQUIRY_STATUS_LABELS[status]}
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
          <td colSpan={5} className="space-y-4 px-3 py-4">
            <div className="rounded-2xl border border-valle-sage-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-valle-forest-900">
                <Home className="h-4 w-4 text-valle-olive-600" />
                Detalles de la propiedad
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-valle-forest-800">
                {inquiry.propertyDetails}
              </p>
            </div>
            <InquiryNotesPanel inquiry={inquiry} onSaveNotes={onSaveNotes} isSyncing={isSyncing} />
          </td>
        </tr>
      ) : null}
    </>
  )
}

export function PropertyInquiryListPage() {
  const { inquiries, isReady, isSyncing, error, updateInquiry, refresh } = usePropertyInquiryStore()
  const [filter, setFilter] = useState<PropertyInquiryStatusFilter>("all")

  const counts = useMemo(() => {
    const result: Record<PropertyInquiryStatusFilter, number> = {
      all: inquiries.length,
      new: 0,
      contacted: 0,
      scheduled: 0,
      rejected: 0,
      archived: 0,
    }

    for (const inquiry of inquiries) {
      result[inquiry.status] += 1
    }

    return result
  }, [inquiries])

  const filtered = useMemo(() => {
    if (filter === "all") return inquiries
    return inquiries.filter((inquiry) => inquiry.status === filter)
  }, [inquiries, filter])

  if (!isReady) {
    return <p className="text-sm text-valle-forest-600">Cargando solicitudes...</p>
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
            Propietarios
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-valle-forest-900 sm:text-3xl">
            ¿Tienes una propiedad?
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-valle-forest-600">
            Solicitudes de administración enviadas desde el formulario del sitio. Da seguimiento al contacto con cada
            propietario.
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
        {PROPERTY_INQUIRY_STATUSES.map((status) => (
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
              {PROPERTY_INQUIRY_STATUS_LABELS[status]}
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
              {filter !== "all" ? ` · ${PROPERTY_INQUIRY_STATUS_LABELS[filter]}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_INQUIRY_STATUS_FILTERS.map((option) => (
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
                {PROPERTY_INQUIRY_STATUS_FILTER_LABELS[option]} ({counts[option]})
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-valle-sage-200 text-[11px] uppercase tracking-[0.14em] text-valle-forest-500">
                  <th className="px-3 py-3 font-semibold">Propietario</th>
                  <th className="px-3 py-3 font-semibold">Contacto</th>
                  <th className="px-3 py-3 font-semibold">Propiedad</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                  <th className="px-3 py-3 font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inquiry) => (
                  <InquiryRow
                    key={inquiry.id}
                    inquiry={inquiry}
                    isSyncing={isSyncing}
                    onStatusChange={(status) => updateInquiry(inquiry.id, { status })}
                    onSaveNotes={(notes) => updateInquiry(inquiry.id, { notes })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-valle-sage-300 px-4 py-8 text-center text-sm text-valle-forest-500">
            {inquiries.length === 0
              ? "Aún no hay solicitudes. Cuando un propietario envíe el formulario «¿Tienes una propiedad?», aparecerá aquí."
              : "No hay solicitudes con este filtro."}
          </p>
        )}
      </section>
    </div>
  )
}
