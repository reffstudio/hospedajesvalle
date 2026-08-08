"use client"

import { useEffect, useRef, useState } from "react"
import { Plus, Star } from "lucide-react"
import { AMENITY_CATALOG } from "@/lib/amenity-catalog"
import { buildCardHighlights } from "@/lib/dashboard/card-highlights"
import type { CustomAmenityDefinition } from "@/lib/dashboard/types"
import { usePropertyStore } from "@/lib/dashboard/property-store"
import {
  CUSTOM_AMENITY_ICONS,
  getCustomAmenityIcon,
  type CustomAmenityIconId,
} from "@/lib/custom-amenity-icons"
import type { AmenityId } from "@/lib/property-amenities"
import { cn } from "@/lib/utils"

type AmenityFeaturePickerProps = {
  amenities: AmenityId[]
  highlightAmenities: AmenityId[]
  customAmenityIds: string[]
  highlightCustomAmenities: string[]
  bedrooms: number
  fullBathrooms: number
  halfBathrooms: number
  onAmenitiesChange: (value: AmenityId[]) => void
  onHighlightAmenitiesChange: (value: AmenityId[]) => void
  onCustomAmenityIdsChange: (value: string[]) => void
  onHighlightCustomAmenitiesChange: (value: string[]) => void
}

function AmenityCard({
  selected,
  highlighted,
  color,
  icon: Icon,
  title,
  subtitle,
  onToggle,
  onToggleHighlight,
}: {
  selected: boolean
  highlighted: boolean
  color: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  subtitle?: string
  onToggle: () => void
  onToggleHighlight: () => void
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-2xl border p-2 transition-all",
        selected
          ? "border-valle-forest-700 bg-valle-forest-900 text-white shadow-[0_10px_30px_rgba(24,40,32,0.12)]"
          : "border-valle-sage-200 bg-white text-valle-forest-800",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        className="flex min-w-0 flex-1 items-start gap-3 rounded-xl px-1 py-1 text-left"
      >
        <span
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            selected ? "bg-white/12" : "bg-valle-sage-100",
          )}
          style={selected ? undefined : { color }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{title}</span>
          {subtitle ? (
            <span className={cn("mt-0.5 block text-xs", selected ? "text-white/70" : "text-valle-forest-500")}>
              {subtitle}
            </span>
          ) : null}
        </span>
      </button>
      <button
        type="button"
        aria-pressed={highlighted}
        aria-label={`${highlighted ? "Quitar de" : "Agregar a"} highlights: ${title}`}
        disabled={!selected}
        onClick={(event) => {
          event.stopPropagation()
          onToggleHighlight()
        }}
        className={cn(
          "dashboard-icon-btn mt-1 shrink-0",
          !selected && "cursor-not-allowed opacity-30",
          highlighted && selected && "bg-valle-gold-500/20 text-valle-gold-300 hover:bg-valle-gold-500/30",
        )}
      >
        <Star className={cn("h-4 w-4", highlighted && "fill-current")} />
      </button>
    </div>
  )
}

export function AmenityFeaturePicker({
  amenities,
  highlightAmenities,
  customAmenityIds,
  highlightCustomAmenities,
  bedrooms,
  fullBathrooms,
  halfBathrooms,
  onAmenitiesChange,
  onHighlightAmenitiesChange,
  onCustomAmenityIdsChange,
  onHighlightCustomAmenitiesChange,
}: AmenityFeaturePickerProps) {
  const { customAmenityCatalog, addCustomAmenityDefinition } = usePropertyStore()
  const [iconMenuOpen, setIconMenuOpen] = useState(false)
  const [draftLabel, setDraftLabel] = useState("")
  const [draftIconId, setDraftIconId] = useState<CustomAmenityIconId>("goal")
  const addRowRef = useRef<HTMLDivElement>(null)

  const toggleAmenity = (id: AmenityId) => {
    onAmenitiesChange(amenities.includes(id) ? amenities.filter((item) => item !== id) : [...amenities, id])
  }

  const toggleHighlight = (id: AmenityId) => {
    if (!amenities.includes(id)) return
    onHighlightAmenitiesChange(
      highlightAmenities.includes(id)
        ? highlightAmenities.filter((item) => item !== id)
        : [...highlightAmenities, id],
    )
  }

  const toggleCustomAmenity = (id: string) => {
    if (customAmenityIds.includes(id)) {
      onCustomAmenityIdsChange(customAmenityIds.filter((item) => item !== id))
      onHighlightCustomAmenitiesChange(highlightCustomAmenities.filter((item) => item !== id))
      return
    }
    onCustomAmenityIdsChange([...customAmenityIds, id])
  }

  const toggleCustomHighlight = (id: string) => {
    if (!customAmenityIds.includes(id)) return
    onHighlightCustomAmenitiesChange(
      highlightCustomAmenities.includes(id)
        ? highlightCustomAmenities.filter((item) => item !== id)
        : [...highlightCustomAmenities, id],
    )
  }

  const addCustomAmenity = async () => {
    const trimmed = draftLabel.trim()
    if (!trimmed) return

    const created = await addCustomAmenityDefinition({ label: trimmed, iconId: draftIconId })
    if (!customAmenityIds.includes(created.id)) {
      onCustomAmenityIdsChange([...customAmenityIds, created.id])
    }

    setDraftLabel("")
    setIconMenuOpen(false)
  }

  useEffect(() => {
    if (!iconMenuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!addRowRef.current?.contains(event.target as Node)) {
        setIconMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [iconMenuOpen])

  const cardHighlights = buildCardHighlights(
    {
      bedrooms,
      fullBathrooms,
      halfBathrooms,
      highlightAmenities,
      highlightCustomAmenities,
    },
    customAmenityCatalog,
  )

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-valle-forest-800">Amenidades</p>
        <p className="mt-1 text-sm text-valle-forest-600">
          Toca para activar o desactivar. La estrella la incluye en los highlights de la tarjeta.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {AMENITY_CATALOG.map((amenity) => (
          <AmenityCard
            key={amenity.id}
            selected={amenities.includes(amenity.id)}
            highlighted={highlightAmenities.includes(amenity.id)}
            color={amenity.color}
            icon={amenity.icon}
            title={amenity.es}
            subtitle={amenity.en}
            onToggle={() => toggleAmenity(amenity.id)}
            onToggleHighlight={() => toggleHighlight(amenity.id)}
          />
        ))}

        {customAmenityCatalog.map((item: CustomAmenityDefinition) => {
          const icon = getCustomAmenityIcon(item.iconId)
          return (
            <AmenityCard
              key={item.id}
              selected={customAmenityIds.includes(item.id)}
              highlighted={highlightCustomAmenities.includes(item.id)}
              color={icon.color}
              icon={icon.icon}
              title={item.label}
              subtitle="Personalizada"
              onToggle={() => toggleCustomAmenity(item.id)}
              onToggleHighlight={() => toggleCustomHighlight(item.id)}
            />
          )
        })}
      </div>

      <div ref={addRowRef} className="relative flex items-center gap-2">
        <button
          type="button"
          aria-expanded={iconMenuOpen}
          aria-label="Elegir icono de amenidad personalizada"
          onClick={() => setIconMenuOpen((open) => !open)}
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
            iconMenuOpen
              ? "border-valle-forest-700 bg-valle-forest-900 text-white"
              : "border-valle-sage-300 bg-white text-valle-forest-700 hover:border-valle-forest-400",
          )}
        >
          <Plus className="h-5 w-5" strokeWidth={1.75} />
        </button>

        {iconMenuOpen ? (
          <div className="absolute left-0 top-full z-20 mt-2 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-valle-sage-200 bg-white p-2 shadow-lg">
            <div className="grid grid-cols-5 gap-1 sm:grid-cols-6">
              {CUSTOM_AMENITY_ICONS.map((option) => {
                const Icon = option.icon
                const selected = draftIconId === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    title={option.label}
                    aria-pressed={selected}
                    onClick={() => {
                      setDraftIconId(option.id)
                      setIconMenuOpen(false)
                    }}
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                      selected
                        ? "border-valle-forest-700 bg-valle-forest-900 text-white"
                        : "border-valle-sage-200 bg-white hover:border-valle-forest-300",
                    )}
                    style={selected ? undefined : { color: option.color }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <input
          className="dashboard-input min-w-0 flex-1"
          value={draftLabel}
          onChange={(event) => setDraftLabel(event.target.value)}
          placeholder="Nombre de amenidad personalizada"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              addCustomAmenity()
            }
          }}
        />

        <button
          type="button"
          className="dashboard-btn-primary shrink-0 px-4"
          disabled={!draftLabel.trim()}
          onClick={addCustomAmenity}
        >
          Agregar
        </button>
      </div>

      <div className="rounded-2xl border border-valle-sage-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-valle-forest-700">
          Highlights de la tarjeta (automático)
        </p>
        <p className="mt-1 text-sm text-valle-forest-600">
          Recámaras y baños desde capacidad. Las amenidades con estrella se agregan aquí.
        </p>
        {cardHighlights.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {cardHighlights.map((line) => (
              <li key={line} className="rounded-xl bg-valle-sage-50 px-3 py-2 text-sm text-valle-forest-800">
                {line}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-valle-forest-500">Define capacidad y marca amenidades con estrella.</p>
        )}
      </div>
    </div>
  )
}
