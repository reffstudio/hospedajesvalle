"use client"

import dynamic from "next/dynamic"
import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { X, Check, User, Mail, CalendarDays, Send } from "lucide-react"
import { submitPreReservationLead } from "@/lib/properties/queries"
import {
  formatFullPhoneNumber,
  getDefaultPhoneCountryIso,
  isValidLocalPhoneNumber,
} from "@/lib/phone/country-calling-codes"
import { usePublishedProperties } from "@/lib/properties/use-published-properties"
import { prefetchPropertyImages } from "@/lib/properties/prefetch-property-images"
import { getDateLocale } from "@/lib/i18n/translations"
import { usePreReservation } from "./pre-reservation-context"
import { PhoneCountryInput } from "./phone-country-input"
import { useLanguage } from "./language-provider"
import { cn } from "@/lib/utils"

const DateRangeCalendar = dynamic(
  () => import("./date-range-calendar").then((mod) => mod.DateRangeCalendar),
  {
    ssr: false,
    loading: () => <div className="h-[280px] animate-pulse rounded-xl bg-valle-sage-100" aria-hidden />,
  },
)

const panelEase = [0.22, 1, 0.36, 1] as const

function PropertyPickerSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-valle-sage-200 bg-valle-sage-50">
          <div className="aspect-[4/3] animate-pulse bg-valle-sage-100" />
        </div>
      ))}
    </div>
  )
}

export function PreReservationModal() {
  const { isOpen, initialPropertyId, close } = usePreReservation()
  const { locale, t, tf } = useLanguage()
  const { properties: featuredProducts, isLoading: isLoadingProperties } = usePublishedProperties(locale)
  const hasOpenedRef = useRef(false)
  const [showCalendar, setShowCalendar] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneCountry, setPhoneCountry] = useState(() => getDefaultPhoneCountryIso(locale))
  const [phoneLocal, setPhoneLocal] = useState("")
  const [guests, setGuests] = useState("2")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const formatDate = (d: Date | null) => {
    if (!d) return "—"
    return d.toLocaleDateString(getDateLocale(locale), { day: "numeric", month: "short", year: "numeric" })
  }

  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setShowCalendar(false)
      return
    }

    prefetchPropertyImages(featuredProducts)

    const frame = window.requestAnimationFrame(() => {
      setShowCalendar(true)
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [isOpen, featuredProducts])

  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialPropertyId ? [initialPropertyId] : [])
      setPhoneCountry(getDefaultPhoneCountryIso(locale))
      setSubmitted(false)
      setSubmitError(null)
    }
  }, [isOpen, initialPropertyId, locale])

  const toggleProperty = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const isValid = useMemo(() => {
    return (
      name.trim() !== "" &&
      /\S+@\S+\.\S+/.test(email) &&
      isValidLocalPhoneNumber(phoneLocal) &&
      selectedIds.length > 0 &&
      checkIn !== null &&
      checkOut !== null
    )
  }, [name, email, phoneLocal, selectedIds, checkIn, checkOut])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !checkIn || !checkOut || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)

    const result = await submitPreReservationLead({
      name: name.trim(),
      email: email.trim(),
      phone: formatFullPhoneNumber(phoneCountry, phoneLocal),
      guests: Number(guests) || 1,
      propertyIds: selectedIds,
      checkIn: checkIn.toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
      locale,
    })

    setIsSubmitting(false)

    if (!result.ok) {
      setSubmitError(result.error)
      return
    }

    setSubmitted(true)
  }

  const resetAndClose = () => {
    close()
    window.setTimeout(() => {
      setName("")
      setEmail("")
      setPhoneCountry(getDefaultPhoneCountryIso(locale))
      setPhoneLocal("")
      setGuests("2")
      setSelectedIds([])
      setCheckIn(null)
      setCheckOut(null)
      setSubmitted(false)
    }, 220)
  }

  const inputClass =
    "w-full pl-11 pr-4 py-3 bg-white border border-valle-sage-200 rounded-xl text-valle-forest-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-valle-wine-600/30 focus:border-valle-wine-600 transition-all"

  const successBody =
    selectedIds.length > 1 ? t.preReservation.successBodyMulti : t.preReservation.successBodySingle

  if (!isOpen && !hasOpenedRef.current) return null

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-black/65" onClick={resetAndClose} aria-hidden />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pre-reservation-title"
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-2xl bg-white shadow-2xl will-change-transform"
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.24, ease: panelEase }}
          >
            <button
              className="absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2 shadow-sm transition-colors hover:bg-neutral-100"
              onClick={resetAndClose}
              aria-label={t.common.close}
            >
              <X size={22} />
            </button>

            {submitted ? (
              <div className="p-10 text-center lg:p-14">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-valle-olive-400/20">
                  <Check size={28} className="text-valle-olive-600" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-valle-forest-900">{t.preReservation.successTitle}</h3>
                <p className="mx-auto max-w-md leading-relaxed text-neutral-600">
                  {tf(successBody, { name: name.split(" ")[0] })}
                </p>
                <button
                  onClick={resetAndClose}
                  className="mt-8 inline-flex items-center rounded-full bg-valle-wine-600 px-6 py-3 font-medium text-white transition-colors hover:bg-valle-wine-700"
                >
                  {t.common.ready}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 lg:p-10">
                <div className="mb-6 pr-10">
                  <h2 id="pre-reservation-title" className="text-2xl font-bold text-valle-forest-900 lg:text-3xl">
                    {t.preReservation.title}
                  </h2>
                  <p className="mt-1 text-neutral-600">{t.preReservation.subtitle}</p>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.preReservation.name}
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.preReservation.email}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_9.5rem]">
                    <PhoneCountryInput
                      locale={locale}
                      countryIso={phoneCountry}
                      localPhone={phoneLocal}
                      onCountryChange={setPhoneCountry}
                      onLocalPhoneChange={setPhoneLocal}
                      countryLabel={t.preReservation.phoneCountry}
                      phonePlaceholder={t.preReservation.phoneNumber}
                    />
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full rounded-xl border border-valle-sage-200 bg-white px-3 py-3 text-sm text-valle-forest-900 focus:border-valle-wine-600 focus:outline-none focus:ring-2 focus:ring-valle-wine-600/30 sm:text-center"
                      aria-label={t.preReservation.guests}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? t.preReservation.guest : t.preReservation.guests}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-valle-forest-900">
                      {t.preReservation.propertiesTitle}
                    </h3>
                    <span className="text-xs text-neutral-500">
                      {selectedIds.length}{" "}
                      {selectedIds.length === 1 ? t.preReservation.selected : t.preReservation.selectedPlural}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-neutral-500">{t.preReservation.multiSelect}</p>
                  {isLoadingProperties && featuredProducts.length === 0 ? (
                    <PropertyPickerSkeleton />
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {featuredProducts.map((property) => {
                        const active = selectedIds.includes(property.id)
                        return (
                          <button
                            key={property.id}
                            type="button"
                            onClick={() => toggleProperty(property.id)}
                            className={cn(
                              "group relative overflow-hidden rounded-xl border-2 text-left transition-colors",
                              active
                                ? "border-valle-wine-600 ring-2 ring-valle-wine-600/20"
                                : "border-transparent hover:border-valle-sage-200",
                            )}
                            aria-pressed={active}
                          >
                            <div className="relative aspect-[4/3] bg-valle-sage-100">
                              <Image
                                src={property.image}
                                alt={property.name}
                                fill
                                loading="eager"
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, 200px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                              {active ? (
                                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-valle-wine-600">
                                  <Check size={14} className="text-white" />
                                </div>
                              ) : null}
                              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                                <p className="text-sm font-semibold leading-tight text-white">{property.name}</p>
                                <p className="text-xs text-white/80">{property.price}</p>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-valle-forest-900">
                    {t.preReservation.datesTitle}
                  </h3>
                  {showCalendar ? (
                    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
                      <div className="rounded-2xl border border-valle-sage-200 p-4">
                        <DateRangeCalendar
                          checkIn={checkIn}
                          checkOut={checkOut}
                          onChange={({ checkIn: nextCheckIn, checkOut: nextCheckOut }) => {
                            setCheckIn(nextCheckIn)
                            setCheckOut(nextCheckOut)
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 rounded-xl border border-valle-sage-200 bg-valle-sage-50 px-4 py-3">
                          <CalendarDays size={18} className="text-valle-olive-600" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-neutral-500">{t.preReservation.checkIn}</p>
                            <p className="text-sm font-medium text-valle-forest-900">{formatDate(checkIn)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-valle-sage-200 bg-valle-sage-50 px-4 py-3">
                          <CalendarDays size={18} className="text-valle-olive-600" />
                          <div>
                            <p className="text-xs uppercase tracking-wide text-neutral-500">{t.preReservation.checkOut}</p>
                            <p className="text-sm font-medium text-valle-forest-900">{formatDate(checkOut)}</p>
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed text-neutral-500">{t.preReservation.calendarHint}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[280px] animate-pulse rounded-2xl bg-valle-sage-100" aria-hidden />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-full py-4 text-lg font-medium transition-colors",
                    isValid && !isSubmitting
                      ? "bg-valle-wine-600 text-white hover:bg-valle-wine-700"
                      : "cursor-not-allowed bg-valle-sage-200 text-neutral-400",
                  )}
                >
                  <Send size={18} />
                  {isSubmitting ? t.preReservation.submitting : t.preReservation.submit}
                </button>
                {submitError ? (
                  <p className="mt-3 text-center text-sm text-valle-wine-700">{submitError}</p>
                ) : null}
                <p className="mt-3 text-center text-xs text-neutral-400">{t.preReservation.disclaimer}</p>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
