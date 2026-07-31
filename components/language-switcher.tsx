"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useLanguage } from "./language-provider"
import type { Locale } from "@/lib/i18n/types"

type LanguageSwitcherProps = {
  variant?: "fixed" | "inline"
  compact?: boolean
  className?: string
}

const options: { value: Locale; label: string; flag: string }[] = [
  { value: "en", label: "EN", flag: "/flags/us.png" },
  { value: "es", label: "ES", flag: "/flags/mx.png" },
]

function LocaleFlag({ flag }: { flag: string }) {
  return (
    <Image
      src={flag}
      alt=""
      aria-hidden
      width={22}
      height={14}
      className="h-3.5 w-[1.375rem] shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/10"
    />
  )
}

export function LanguageSwitcher({ variant = "fixed", compact = false, className }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={cn(
        "inline-flex items-center rounded-full border p-0.5 backdrop-blur-md",
        variant === "fixed"
          ? "fixed top-4 right-4 z-[45] border-white/20 bg-black/35"
          : "border-white/15 bg-white/10",
        className,
      )}
    >
      {options.map((option) => {
        const active = locale === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            aria-pressed={active}
            aria-label={option.value === "en" ? "English" : "Español"}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-full px-1.5 py-1 text-[11px] font-semibold tracking-wide transition-colors sm:px-2",
              compact ? "min-w-[2rem] sm:min-w-[2.85rem]" : "min-w-[2.85rem]",
              active ? "bg-white text-valle-forest-900" : "text-white/75 hover:text-white",
            )}
          >
            <LocaleFlag flag={option.flag} />
            <span className={cn(compact && "hidden min-[420px]:inline")}>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
