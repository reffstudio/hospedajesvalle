"use client"

import { Toaster } from "sonner"

export function DashboardToaster() {
  return (
    <Toaster
      position="top-right"
      closeButton
      expand
      visibleToasts={4}
      toastOptions={{
        duration: 8000,
        classNames: {
          toast:
            "group toast rounded-2xl border border-valle-sage-200 bg-valle-cream-50 text-valle-forest-900 shadow-lg",
          title: "text-sm font-semibold text-valle-forest-900",
          description: "text-sm text-valle-forest-600",
          actionButton:
            "rounded-full bg-valle-forest-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-valle-forest-800",
          cancelButton:
            "rounded-full border border-valle-sage-300 bg-white px-3 py-1.5 text-xs font-semibold text-valle-forest-700",
          closeButton:
            "border-valle-sage-200 bg-white text-valle-forest-600 hover:bg-valle-sage-50",
        },
      }}
    />
  )
}
