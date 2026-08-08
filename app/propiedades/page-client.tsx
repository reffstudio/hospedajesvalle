"use client"

import { LanguageProvider } from "@/components/language-provider"
import { PreReservationProvider } from "@/components/pre-reservation-context"
import { PreReservationModal } from "@/components/pre-reservation-modal"
import { PreReservationWarmup } from "@/components/pre-reservation-warmup"
import { SiteChromeHeader } from "@/components/site-chrome-header"
import { PropertiesDirectory } from "@/components/properties-directory"
import { Footer } from "@/components/footer"

export default function PropiedadesPageClient() {
  return (
    <LanguageProvider>
      <PreReservationProvider>
        <SiteChromeHeader />
        <main className="min-h-screen">
          <PropertiesDirectory />
          <Footer />
        </main>
        <PreReservationWarmup />
        <PreReservationModal />
      </PreReservationProvider>
    </LanguageProvider>
  )
}
