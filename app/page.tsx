/*
  ==============================================================
  R E F F   S T U D I O
  Worldwide Creativity
  ==============================================================
  Intentional Design  •  Functional Logic

  "Design. Code. Systems. One Studio. Globally."

  Web: https://reff.studio
  Contact: hello@reff.studio
  ==============================================================
*/
"use client"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { HeroScrollProvider } from "@/components/hero-scroll-context"
import { LanguageProvider } from "@/components/language-provider"
import { SiteLanguageSwitcher } from "@/components/site-language-switcher"
import { CollectionStrip } from "@/components/collection-strip"
import { ReviewsSection } from "@/components/reviews-section"
import { OwnersSection } from "@/components/owners-section"
import { Footer } from "@/components/footer"
import { PreReservationProvider } from "@/components/pre-reservation-context"
import { PreReservationModal } from "@/components/pre-reservation-modal"
import { HomeHashScroll } from "@/components/home-hash-scroll"

export default function HomePage() {
  return (
    <LanguageProvider>
      <PreReservationProvider>
        <HeroScrollProvider>
          <HomeHashScroll />
          <SiteLanguageSwitcher />
          <main className="min-h-screen">
            <Header />
            <HeroSection />
            <CollectionStrip />
            <ReviewsSection />
            <OwnersSection />
            <Footer />
          </main>
        </HeroScrollProvider>
        <PreReservationModal />
      </PreReservationProvider>
    </LanguageProvider>
  )
}
