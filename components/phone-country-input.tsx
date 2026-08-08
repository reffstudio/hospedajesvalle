"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"
import type { Locale } from "@/lib/i18n/types"
import {
  countryFlagEmoji,
  formatCountryOptionLabel,
  getCountryByIso,
  getCountryCallingCodes,
  normalizeLocalPhoneDigits,
} from "@/lib/phone/country-calling-codes"
import { cn } from "@/lib/utils"

type PhoneCountryInputProps = {
  locale: Locale
  countryIso: string
  localPhone: string
  onCountryChange: (iso2: string) => void
  onLocalPhoneChange: (value: string) => void
  countryLabel: string
  phonePlaceholder: string
  className?: string
}

export function PhoneCountryInput({
  locale,
  countryIso,
  localPhone,
  onCountryChange,
  onLocalPhoneChange,
  countryLabel,
  phonePlaceholder,
  className,
}: PhoneCountryInputProps) {
  const countries = getCountryCallingCodes(locale)
  const selectedCountry = getCountryByIso(countryIso) ?? countries[0]
  const [open, setOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 288 })
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return

    const updatePosition = () => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.min(288, window.innerWidth - 24),
      })
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if (listRef.current?.contains(target)) return
      setOpen(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  const handleCountrySelect = (iso2: string) => {
    onCountryChange(iso2)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <div
        className={cn(
          "flex items-stretch rounded-xl border border-valle-sage-200 bg-white transition-all",
          "focus-within:border-valle-wine-600 focus-within:ring-2 focus-within:ring-valle-wine-600/30",
        )}
      >
        <div className="relative shrink-0 border-r border-valle-sage-200">
          <button
            ref={triggerRef}
            type="button"
            id={`${listboxId}-trigger`}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-label={countryLabel}
            onClick={() => setOpen((current) => !current)}
            className="flex h-full min-h-[3rem] items-center gap-1.5 rounded-l-xl px-2.5 py-3 text-sm font-medium text-valle-forest-900 transition-colors hover:bg-valle-sage-50 sm:px-3"
          >
            <span className="text-base leading-none" aria-hidden="true">
              {countryFlagEmoji(selectedCountry.iso2)}
            </span>
            <span className="tabular-nums">{selectedCountry.dialCode}</span>
            <ChevronDown
              className={cn("h-3.5 w-3.5 text-neutral-400 transition-transform", open && "rotate-180")}
            />
          </button>
        </div>

        <input
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel-national"
          value={localPhone}
          onChange={(event) => onLocalPhoneChange(normalizeLocalPhoneDigits(event.target.value))}
          placeholder={phonePlaceholder}
          className="min-w-0 flex-1 rounded-r-xl border-0 bg-transparent px-3 py-3 text-valle-forest-900 placeholder-neutral-400 focus:outline-none sm:px-4"
          aria-label={phonePlaceholder}
        />
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-labelledby={`${listboxId}-trigger`}
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
              }}
              className="fixed z-[100] max-h-56 overflow-y-auto rounded-xl border border-valle-sage-200 bg-white py-1 shadow-lg"
            >
              {countries.map((country) => {
                const active = country.iso2 === countryIso
                return (
                  <li key={country.iso2} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => handleCountrySelect(country.iso2)}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                        active
                          ? "bg-valle-sage-50 text-valle-forest-900"
                          : "text-valle-forest-800 hover:bg-valle-sage-50",
                      )}
                    >
                      <span className="text-base leading-none">{countryFlagEmoji(country.iso2)}</span>
                      <span className="shrink-0 tabular-nums text-valle-forest-600">{country.dialCode}</span>
                      <span className="min-w-0 truncate">{country.name[locale]}</span>
                    </button>
                  </li>
                )
              })}
            </ul>,
            document.body,
          )
        : null}

      <p className="sr-only">{formatCountryOptionLabel(selectedCountry, locale)}</p>
    </div>
  )
}
