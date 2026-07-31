"use client"

import { formatBathroomBreakdown, formatDimensionsLabel } from "@/lib/dashboard/property-content"
import { cn } from "@/lib/utils"

type CapacityPreviewProps = {
  maxGuests: number
  bedrooms: number
  fullBathrooms: number
  halfBathrooms: number
  className?: string
}

export function CapacityPreview({
  maxGuests,
  bedrooms,
  fullBathrooms,
  halfBathrooms,
  className,
}: CapacityPreviewProps) {
  const capacity = { maxGuests, bedrooms, fullBathrooms, halfBathrooms }
  const breakdownEs = formatBathroomBreakdown(fullBathrooms, halfBathrooms, "es")
  const breakdownEn = formatBathroomBreakdown(fullBathrooms, halfBathrooms, "en")

  return (
    <div className={cn("rounded-2xl border border-valle-sage-200 bg-valle-sage-50/70 p-4", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-valle-forest-700">
        Capacidad en el sitio (según idioma del visitante)
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-white px-3 py-2 text-sm text-valle-forest-800">
          <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-valle-forest-500">ES</span>
          {formatDimensionsLabel(capacity, "es")}
          {breakdownEs ? <span className="mt-1 block text-xs text-valle-forest-500">{breakdownEs}</span> : null}
        </div>
        <div className="rounded-xl bg-white px-3 py-2 text-sm text-valle-forest-800">
          <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-valle-forest-500">EN</span>
          {formatDimensionsLabel(capacity, "en")}
          {breakdownEn ? <span className="mt-1 block text-xs text-valle-forest-500">{breakdownEn}</span> : null}
        </div>
      </div>
    </div>
  )
}
