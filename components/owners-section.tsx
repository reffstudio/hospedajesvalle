"use client"

import { useState } from "react"
import { Reveal } from "./reveal"
import { PropertyManagementModal } from "./property-management-modal"
import { useLanguage } from "./language-provider"

export function OwnersSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <>
      <section className="py-16 lg:py-24 bg-valle-forest-900 text-white" id="administracion">
        <div className="container-custom">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4 text-balance">
                {t.owners.title}{" "}
                <span className="italic font-light">{t.owners.titleEm}</span>
              </h2>
              <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-8 text-pretty">{t.owners.subtitle}</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center rounded-full bg-white text-valle-forest-900 px-8 py-4 font-medium hover:bg-valle-cream-100 transition-colors"
              >
                {t.owners.cta}
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <PropertyManagementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
