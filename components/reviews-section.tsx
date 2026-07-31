"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { Reveal } from "./reveal"
import { useLanguage } from "./language-provider"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-valle-gold-500 text-valle-gold-500" : "text-valle-sage-300"}
        />
      ))}
    </div>
  )
}

export function ReviewsSection() {
  const { t } = useLanguage()

  return (
    <section className="bg-valle-cream-50 py-20 lg:py-28" id="reviews">
      <div className="container-custom">
        <Reveal>
          <div className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
            <h2 className="mb-4 text-5xl font-normal text-valle-forest-900 lg:text-6xl">{t.reviews.title}</h2>
            <p className="text-lg text-neutral-600">{t.reviews.subtitle}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mb-12 flex max-w-md items-center justify-center gap-8 sm:gap-12 lg:mb-16">
            <div className="text-center">
              <p className="text-4xl font-bold text-valle-wine-600">{t.reviews.average}</p>
              <StarRating rating={5} />
              <p className="mt-1 text-xs text-neutral-500">{t.reviews.averageLabel}</p>
            </div>
            <div className="h-12 w-px bg-valle-sage-300" />
            <div className="text-center">
              <p className="text-4xl font-bold text-valle-forest-900">{t.reviews.total}</p>
              <p className="mt-2 text-xs text-neutral-500">{t.reviews.totalLabel}</p>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {t.reviews.items.map((review, index) => (
            <Reveal key={`${review.name}-${index}`} delay={0.05 * index}>
              <motion.article
                className="relative flex h-full flex-col rounded-2xl border border-valle-sage-200 bg-white p-6 shadow-[0_10px_50px_rgba(0,0,0,0.06)] lg:p-8"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <Quote size={28} className="mb-4 text-valle-sage-300" aria-hidden />
                <StarRating rating={review.rating} />
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-neutral-700">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <footer className="mt-6 border-t border-valle-sage-100 pt-5">
                  <p className="font-semibold text-valle-forest-900">{review.name}</p>
                  <p className="text-sm text-neutral-500">{review.origin}</p>
                  <p className="mt-1 text-sm font-medium text-valle-wine-600">{review.property}</p>
                  <p className="mt-1 text-xs text-neutral-400">{review.date}</p>
                </footer>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
