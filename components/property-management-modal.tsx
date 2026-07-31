"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, User, Mail, Phone, Send, Home } from "lucide-react"
import { BlurPanel } from "./blur-panel"
import { cn } from "@/lib/utils"
import { useLanguage } from "./language-provider"

interface PropertyManagementModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PropertyManagementModal({ isOpen, onClose }: PropertyManagementModalProps) {
  const { t, tf } = useLanguage()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [propertyDetails, setPropertyDetails] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const isValid =
    name.trim() !== "" && phone.trim() !== "" && /\S+@\S+\.\S+/.test(email) && propertyDetails.trim() !== ""

  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [isOpen])

  const resetAndClose = () => {
    onClose()
    setTimeout(() => {
      setName("")
      setPhone("")
      setEmail("")
      setPropertyDetails("")
      setSubmitted(false)
    }, 300)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    console.log("[PropertyManagement] Solicitud enviada:", { name, phone, email, propertyDetails })
    setSubmitted(true)
  }

  const inputClass =
    "w-full pl-11 pr-4 py-3 bg-white border border-valle-sage-200 rounded-xl text-valle-forest-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-valle-wine-600/30 focus:border-valle-wine-600 transition-all"

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetAndClose} />

          <motion.div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <BlurPanel className="bg-white/95 backdrop-blur-md">
              <button
                type="button"
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full transition-colors duration-200 shadow-sm"
                onClick={resetAndClose}
                aria-label={t.common.close}
              >
                <X size={22} />
              </button>

              <div className="p-8">
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-valle-olive-400/20 rounded-full flex items-center justify-center mx-auto mb-5">
                      <Check size={28} className="text-valle-olive-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-valle-forest-900 mb-3">{t.propertyModal.successTitle}</h3>
                    <p className="text-neutral-600 max-w-sm mx-auto leading-relaxed">
                      {tf(t.propertyModal.successBody, { name: name.split(" ")[0] })}
                    </p>
                    <button
                      type="button"
                      onClick={resetAndClose}
                      className="mt-8 inline-flex items-center rounded-full bg-valle-wine-600 text-white px-6 py-3 font-medium hover:bg-valle-wine-700 transition-colors"
                    >
                      {t.common.close}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-8 pr-8">
                      <p className="text-label text-valle-olive-600 mb-2">{t.propertyModal.label}</p>
                      <h2 className="text-2xl lg:text-3xl font-bold text-valle-forest-900 mb-3 text-balance">
                        {t.propertyModal.title}
                      </h2>
                      <p className="text-neutral-600 leading-relaxed text-sm">{t.propertyModal.subtitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t.propertyModal.name}
                          className={inputClass}
                          required
                        />
                      </div>

                      <div className="relative">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={t.propertyModal.phone}
                          className={inputClass}
                          required
                        />
                      </div>

                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t.propertyModal.email}
                          className={inputClass}
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="property-details"
                          className="flex items-center gap-2 text-sm font-semibold text-valle-forest-900 uppercase tracking-wide mb-2"
                        >
                          <Home size={16} className="text-valle-olive-600" />
                          {t.propertyModal.aboutLabel}
                        </label>
                        <textarea
                          id="property-details"
                          value={propertyDetails}
                          onChange={(e) => setPropertyDetails(e.target.value)}
                          placeholder={t.propertyModal.aboutPlaceholder}
                          rows={5}
                          className="w-full px-4 py-3 bg-white border border-valle-sage-200 rounded-xl text-valle-forest-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-valle-wine-600/30 focus:border-valle-wine-600 transition-all resize-none"
                          required
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={!isValid}
                        className={cn(
                          "mt-2 w-full py-4 rounded-full font-medium text-lg transition-colors duration-200 flex items-center justify-center gap-2",
                          isValid
                            ? "bg-valle-wine-600 text-white hover:bg-valle-wine-700"
                            : "bg-valle-sage-200 text-neutral-400 cursor-not-allowed",
                        )}
                        whileHover={isValid ? { scale: 1.02 } : undefined}
                        whileTap={isValid ? { scale: 0.98 } : undefined}
                      >
                        <Send size={20} />
                        {t.common.requestInfo}
                      </motion.button>
                    </form>
                  </>
                )}
              </div>
            </BlurPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
