"use client"

import type { PropertyCurrency } from "@/lib/dashboard/types"
import { currencyOptions } from "@/lib/dashboard/price"
import { cn } from "@/lib/utils"

type PriceCurrencyInputProps = {
  priceLabel: string
  currency: PropertyCurrency
  onPriceChange: (priceLabel: string) => void
  onCurrencyChange: (currency: PropertyCurrency) => void
}

export function PriceCurrencyInput({
  priceLabel,
  currency,
  onPriceChange,
  onCurrencyChange,
}: PriceCurrencyInputProps) {
  return (
    <label className="dashboard-field">
      <span>Precio</span>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          className="dashboard-input min-w-0 flex-1"
          value={priceLabel}
          onChange={(event) => onPriceChange(event.target.value)}
          placeholder="$6,900"
          inputMode="decimal"
        />
        <div
          className="inline-flex shrink-0 overflow-hidden rounded-xl border border-valle-sage-200 bg-white p-1"
          role="group"
          aria-label="Moneda"
        >
          {currencyOptions.map((option) => {
            const selected = currency === option.value
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => onCurrencyChange(option.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  selected
                    ? "bg-valle-forest-900 text-white shadow-sm"
                    : "text-valle-forest-700 hover:bg-valle-sage-50",
                )}
              >
                <span aria-hidden className="text-base leading-none">
                  {option.flag}
                </span>
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </label>
  )
}
