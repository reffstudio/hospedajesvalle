"use client"

import type { AmenityListItem } from "@/lib/amenity-list"
import { cn } from "@/lib/utils"

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
        const Icon = item.icon
        return (
          <li
            key={item.id}
            className="flex aspect-square flex-col items-center justify-center rounded-xl border border-valle-sage-200 bg-valle-sage-50/70 p-2 text-center"
          >
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm"
              style={{ color: item.color }}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span className="mt-2 line-clamp-2 text-[10px] font-medium leading-tight text-valle-forest-800 sm:text-[11px]">
              {item.label}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
