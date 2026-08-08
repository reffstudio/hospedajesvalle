"use client"

import type { LucideIcon } from "lucide-react"
import { HelpCircle } from "lucide-react"
import { AMENITY_CATALOG_BY_ID, isAmenityId } from "@/lib/amenity-catalog"
import type { AmenityListItem } from "@/lib/amenity-list"
import { cn } from "@/lib/utils"

function resolveIcon(item: AmenityListItem): LucideIcon {
  if (typeof item.icon === "function") {
    return item.icon
  }

  if (isAmenityId(item.id)) {
    return AMENITY_CATALOG_BY_ID[item.id].icon
  }

  return HelpCircle
}

type AmenityIconListProps = {
  items: AmenityListItem[]
  className?: string
  emptyLabel?: string
}

export function AmenityIconList({ items, className, emptyLabel }: AmenityIconListProps) {
  if (items.length === 0) {
    return emptyLabel ? <p className="text-sm text-valle-forest-500">{emptyLabel}</p> : null
  }

  return (
    <ul
      className={cn(
        "grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = resolveIcon(item)
        return (
          <li
            key={item.id}
            className="flex h-[6.75rem] flex-col items-center justify-between rounded-xl border border-valle-sage-200 bg-valle-sage-50/70 p-2 text-center sm:h-[7.25rem]"
          >
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm"
              style={{ color: item.color }}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="mt-2 line-clamp-2 min-h-[2.25rem] w-full text-[10px] font-medium leading-tight text-valle-forest-800 sm:text-[11px]">
              {item.label}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
