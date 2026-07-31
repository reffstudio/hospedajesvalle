"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useLanguage } from "./language-provider"

const ease = [0.21, 0.47, 0.32, 0.98] as const

const heroMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease },
}

const navMotion = {
  initial: false,
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease },
}

type BrandLogoProps = {
  variant: "hero" | "nav"
  className?: string
  href?: string
}

export function BrandLogo({ variant, className, href = "/" }: BrandLogoProps) {
  const { t } = useLanguage()
  const motionProps = variant === "hero" ? heroMotion : navMotion

  return (
    <motion.a
      href={href}
      aria-label={t.common.brandAria}
      className={cn("block", className)}
      {...motionProps}
    >
      <Image
        src="/logo-hospedajes-valle.png"
        alt="Hospedajes en Valle de Guadalupe"
        width={variant === "hero" ? 208 : 64}
        height={variant === "hero" ? 208 : 64}
        priority={variant === "hero"}
        className={cn(
          "object-contain mx-auto",
          variant === "hero"
            ? "h-32 w-32 sm:h-40 sm:w-40 md:h-44 md:w-44 lg:h-52 lg:w-52 drop-shadow-lg"
            : "h-14 w-14 lg:h-16 lg:w-16",
        )}
      />
    </motion.a>
  )
}
