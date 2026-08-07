"use client"

import { type MouseEvent } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { scrollToHeroStart } from "@/lib/hero-featured-scroll"
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
  const pathname = usePathname()
  const { t } = useLanguage()
  const motionProps = variant === "hero" ? heroMotion : navMotion

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (variant === "nav" && pathname === "/" && href === "/") {
      event.preventDefault()
      scrollToHeroStart()
    }
  }

  return (
    <motion.a
      href={href}
      aria-label={t.common.brandAria}
      className={cn("block", className)}
      onClick={handleClick}
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
            ? "h-auto w-auto drop-shadow-lg"
            : "h-11 w-11 md:h-14 md:w-14 lg:h-16 lg:w-16",
        )}
      />
    </motion.a>
  )
}
