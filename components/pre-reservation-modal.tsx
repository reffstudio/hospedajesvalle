"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { X, Check, User, Mail, Phone, Users, CalendarDays, Send } from "lucide-react"
import { getPublishedProperties, submitPreReservationLead } from "@/lib/properties/queries"
import { getDateLocale } from "@/lib/i18n/translations"
import { usePreReservation } from "./pre-reservation-context"
import { DateRangeCalendar } from "./date-range-calendar"
import { useLanguage } from "./language-provider"
import { cn } from "@/lib/utils"

export function PreReservationModal() {
  const { isOpen, initialPropertyId, close } = usePreReservation()
  const { locale, t, tf } = useLanguage()
  const featuredProducts = useMemo(() => getPublishedProperties(locale), [locale])

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [guests, setGuests] = useState("2")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const formatDate = (d: Date | null) => {
    if (!d) return "—"
    return d.toLocaleDateString(getDateLocale(locale), { day: "numeric", month: "short", year: "numeric" })
  }

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
      setSubmitted(false)
    }
  }, [isOpen, initialPropertyId])

  const toggleProperty = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const isValid = useMemo(() => {
    return (
      name.trim() !== "" &&
      /\S+@\S+\.\S+/.test(email) &&
      phone.trim() !== "" &&
      selectedIds.length > 0 &&
      checkIn !== null &&
      checkOut !== null
    )
  }, [name, email, phone, selectedIds, checkIn, checkOut])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !checkIn || !checkOut) return

    const result = await submitPreReservationLead({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      guests: Number(guests) || 1,
      propertyIds: selectedIds,
      checkIn: checkIn.toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
      locale,
    })

    if (!result.ok) {
      console.error("Pre-reserva:", result.error)
      return
    }

    setSubmitted(true)
  }

  const resetAndClose = () => {
    close()
    setTimeout(() => {
      setName("")
      setEmail("")
      setPhone("")
      setGuests("2")
      setSelectedIds([])
      setCheckIn(null)
      setCheckOut(null)
      setSubmitted(false)
    }, 300)
  }

  const inputClass =
    "w-full pl-11 pr-4 py-3 bg-white border border-valle-sage-200 rounded-xl text-valle-forest-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-valle-wine-600/30 focus:border-valle-wine-600 transition-all"

  const successBody =
    selectedIds.length > 1 ? t.preReservation.successBodyMulti : t.preReservation.successBodySingle

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetAndClose} />

          <motion.div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-2xl bg-white shadow-2xl"
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <button
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm hover:bg-neutral-100 rounded-full transition-colors shadow-sm"
              onClick={resetAndClose}
              aria-label={t.common.close}
            >
              <X size={22} />
            </button>

            {submitted ? (
              <div className="p-10 lg:p-14 text-center">
                <div className="w-16 h-16 bg-valle-olive-400/20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Check size={28} className="text-valle-olive-600" />
                </div>
                <h3 className="text-2xl font-bold text-valle-forest-900 mb-3">{t.preReservation.successTitle}</h3>
                <p className="text-neutral-600 max-w-md mx-auto leading-relaxed">
                  {tf(successBody, { name: name.split(" ")[0] })}
                </p>
                <button
                  onClick={resetAndClose}
                  className="mt-8 inline-flex items-center rounded-full bg-valle-wine-600 text-white px-6 py-3 font-medium hover:bg-valle-wine-700 transition-colors"
                >
                  {t.common.ready}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 lg:p-10">
                <div className="mb-6 pr-10">
                  <h2 className="text-2xl lg:text-3xl font-bold text-valle-forest-900">{t.preReservation.title}</h2>
                  <p className="text-neutral-600 mt-1">{t.preReservation.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.preReservation.phone}
                      className={inputClass}
                    />
                  </div>
                  <div className="relative">
                    <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className={cn(inputClass, "appearance-none cursor-pointer")}
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
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-valle-forest-900 uppercase tracking-wide">
                      {t.preReservation.propertiesTitle}
                    </h3>
                    <span className="text-xs text-neutral-500">
                      {selectedIds.length}{" "}
                      {selectedIds.length === 1 ? t.preReservation.selected : t.preReservation.selectedPlural}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mb-4">{t.preReservation.multiSelect}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {featuredProducts.map((property) => {
                      const active = selectedIds.includes(property.id)
                      return (
                        <button
                          key={property.id}
                          type="button"
                          onClick={() => toggleProperty(property.id)}
                          className={cn(
                            "group relative rounded-xl overflow-hidden border-2 text-left transition-all",
                            active ? "border-valle-wine-600 ring-2 ring-valle-wine-600/20" : "border-transparent hover:border-valle-sage-200",
                          )}
                          aria-pressed={active}
                        >
                          <div className="relative aspect-[4/3]">
                            <Image
                              src={property.image}
                              alt={property.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, 200px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                            {active && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-valle-wine-600 rounded-full flex items-center justify-center">
                                <Check size={14} className="text-white" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-2.5">
                              <p className="text-white text-sm font-semibold leading-tight">{property.name}</p>
                              <p className="text-white/80 text-xs">{property.price}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-valle-forest-900 uppercase tracking-wide mb-3">
                    {t.preReservation.datesTitle}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="rounded-2xl border border-valle-sage-200 p-4">
                      <DateRangeCalendar
                        checkIn={checkIn}
                        checkOut={checkOut}
                        onChange={({ checkIn, checkOut }) => {
                          setCheckIn(checkIn)
                          setCheckOut(checkOut)
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 rounded-xl bg-valle-sage-50 border border-valle-sage-200 px-4 py-3">
                        <CalendarDays size={18} className="text-valle-olive-600" />
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wide">{t.preReservation.checkIn}</p>
                          <p className="text-sm font-medium text-valle-forest-900">{formatDate(checkIn)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl bg-valle-sage-50 border border-valle-sage-200 px-4 py-3">
                        <CalendarDays size={18} className="text-valle-olive-600" />
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wide">{t.preReservation.checkOut}</p>
                          <p className="text-sm font-medium text-valle-forest-900">{formatDate(checkOut)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">{t.preReservation.calendarHint}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isValid}
                  className={cn(
                    "w-full py-4 rounded-full font-medium text-lg flex items-center justify-center gap-2 transition-all",
                    isValid
                      ? "bg-valle-wine-600 text-white hover:bg-valle-wine-700"
                      : "bg-valle-sage-200 text-neutral-400 cursor-not-allowed",
                  )}
                >
                  <Send size={18} />
                  {t.preReservation.submit}
                </button>
                <p className="text-xs text-neutral-400 text-center mt-3">{t.preReservation.disclaimer}</p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
