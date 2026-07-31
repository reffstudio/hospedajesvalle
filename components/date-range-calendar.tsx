"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "./language-provider"

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isSameDay(a: Date | null, b: Date | null) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

interface DateRangeCalendarProps {
  checkIn: Date | null
  checkOut: Date | null
  onChange: (range: { checkIn: Date | null; checkOut: Date | null }) => void
}

export function DateRangeCalendar({ checkIn, checkOut, onChange }: DateRangeCalendarProps) {
  const { t } = useLanguage()
  const today = startOfDay(new Date())
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [hovered, setHovered] = useState<Date | null>(null)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const canGoPrev = new Date(year, month, 1) > new Date(today.getFullYear(), today.getMonth(), 1)

  const handleDayClick = (day: Date) => {
    if (day < today) return
    if (!checkIn || (checkIn && checkOut)) {
      onChange({ checkIn: day, checkOut: null })
      return
    }
    if (day <= checkIn) {
      onChange({ checkIn: day, checkOut: null })
    } else {
      onChange({ checkIn, checkOut: day })
    }
  }

  const rangeEnd = checkOut ?? hovered

  const cells: (Date | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => canGoPrev && setViewDate(new Date(year, month - 1, 1))}
          disabled={!canGoPrev}
          className={cn(
            "p-2 rounded-full transition-colors",
            canGoPrev ? "hover:bg-valle-sage-100 text-valle-forest-700" : "text-neutral-300 cursor-not-allowed",
          )}
          aria-label={t.calendar.prevMonth}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-valle-forest-900">
          {t.calendar.months[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-2 rounded-full hover:bg-valle-sage-100 text-valle-forest-700 transition-colors"
          aria-label={t.calendar.nextMonth}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {t.calendar.weekdays.map((w) => (
          <div key={w} className="text-center text-xs font-medium text-neutral-400 py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />

          const isPast = day < today
          const isCheckIn = isSameDay(day, checkIn)
          const isCheckOut = isSameDay(day, checkOut)
          const inRange = checkIn && rangeEnd && day > checkIn && day < rangeEnd && day >= today
          const isEndpoint = isCheckIn || isCheckOut

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "relative flex items-center justify-center",
                inRange && "bg-valle-sage-100",
                isCheckIn && checkOut && "bg-gradient-to-r from-transparent to-valle-sage-100",
                isCheckOut && "bg-gradient-to-l from-transparent to-valle-sage-100",
              )}
            >
              <button
                type="button"
                disabled={isPast}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => checkIn && !checkOut && setHovered(day)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "w-9 h-9 rounded-full text-sm flex items-center justify-center transition-colors",
                  isPast && "text-neutral-300 cursor-not-allowed",
                  !isPast && !isEndpoint && "text-valle-forest-700 hover:bg-valle-sage-200",
                  isEndpoint && "bg-valle-wine-600 text-white font-semibold hover:bg-valle-wine-600",
                )}
              >
                {day.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
