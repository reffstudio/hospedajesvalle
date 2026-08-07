"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { usePreReservation } from "./pre-reservation-context"
import { useLanguage } from "./language-provider"

const ease = [0.21, 0.47, 0.32, 0.98] as const

type PreReservarButtonProps = {
  variant: "hero" | "nav"
  className?: string
  /** Always show the full label (used for centered mobile nav CTA). */
  prominent?: boolean
}

export function PreReservarButton({ variant, className, prominent = false }: PreReservarButtonProps) {
  const { open } = usePreReservation()
  const { t } = useLanguage()
  const isHero = variant === "hero"

  return (
    <motion.button
      type="button"
      onClick={() => open()}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "pre-reservar-btn pre-reservar-btn--hero-cta group relative isolate inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-[filter,transform] hover:brightness-110",
        className,
      )}
    >
      <span className="pre-reservar-btn__gradient pointer-events-none absolute inset-0 rounded-full" aria-hidden />
      <span className="pre-reservar-btn__glow pointer-events-none absolute inset-0 rounded-full" aria-hidden />
      <span className="pre-reservar-btn__shimmer pointer-events-none absolute inset-0 rounded-full" aria-hidden />
      <span className="relative z-10">
        {isHero || prominent ? (
          t.common.preReserve
        ) : (
          <>
            <span className="sm:hidden">{t.common.preReserveShort}</span>
            <span className="hidden sm:inline">{t.common.preReserve}</span>
          </>
        )}
      </span>
    </motion.button>
  )
}
