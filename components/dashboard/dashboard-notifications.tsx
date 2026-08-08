"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useLeadStore } from "@/lib/dashboard/lead-store"
import { usePropertyInquiryStore } from "@/lib/dashboard/property-inquiry-store"

function trackKnownIds<T extends { id: string }>(items: T[], knownIds: Set<string>, isReady: boolean) {
  if (!isReady) return false

  if (!knownIds.size && items.length >= 0) {
    for (const item of items) {
      knownIds.add(item.id)
    }
    return true
  }

  return false
}

export function DashboardNotifications() {
  const router = useRouter()
  const { leads, isReady: leadsReady } = useLeadStore()
  const { inquiries, isReady: inquiriesReady } = usePropertyInquiryStore()

  const knownLeadIds = useRef(new Set<string>())
  const knownInquiryIds = useRef(new Set<string>())
  const leadsSeeded = useRef(false)
  const inquiriesSeeded = useRef(false)

  useEffect(() => {
    if (!leadsReady) return

    if (!leadsSeeded.current) {
      leadsSeeded.current = trackKnownIds(leads, knownLeadIds.current, leadsReady)
      return
    }

    for (const lead of leads) {
      if (knownLeadIds.current.has(lead.id)) continue

      knownLeadIds.current.add(lead.id)

      if (lead.status !== "new") continue

      toast.custom(
        (toastId) => (
          <button
            type="button"
            onClick={() => {
              router.push(`/dashboard/pre-reservations?entry=${lead.id}`)
              toast.dismiss(toastId)
            }}
            className="flex w-full max-w-sm flex-col rounded-2xl border border-valle-sage-200 bg-valle-cream-50 p-4 text-left shadow-lg transition-colors hover:bg-white"
          >
            <p className="text-sm font-semibold text-valle-forest-900">Nueva pre-reserva</p>
            <p className="mt-1 text-sm text-valle-forest-600">
              {lead.name} · {lead.guests} {lead.guests === 1 ? "huésped" : "huéspedes"}
            </p>
            <span className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-valle-wine-700">
              Ver entrada →
            </span>
          </button>
        ),
        { duration: 8000 },
      )
    }
  }, [leads, leadsReady, router])

  useEffect(() => {
    if (!inquiriesReady) return

    if (!inquiriesSeeded.current) {
      inquiriesSeeded.current = trackKnownIds(inquiries, knownInquiryIds.current, inquiriesReady)
      return
    }

    for (const inquiry of inquiries) {
      if (knownInquiryIds.current.has(inquiry.id)) continue

      knownInquiryIds.current.add(inquiry.id)

      if (inquiry.status !== "new") continue

      toast.custom(
        (toastId) => (
          <button
            type="button"
            onClick={() => {
              router.push(`/dashboard/property-inquiries?entry=${inquiry.id}`)
              toast.dismiss(toastId)
            }}
            className="flex w-full max-w-sm flex-col rounded-2xl border border-valle-sage-200 bg-valle-cream-50 p-4 text-left shadow-lg transition-colors hover:bg-white"
          >
            <p className="text-sm font-semibold text-valle-forest-900">Nueva propiedad</p>
            <p className="mt-1 text-sm text-valle-forest-600">{inquiry.name}</p>
            <span className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-valle-wine-700">
              Ver entrada →
            </span>
          </button>
        ),
        { duration: 8000 },
      )
    }
  }, [inquiries, inquiriesReady, router])

  return null
}
