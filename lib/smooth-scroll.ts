import {
  HERO_FEATURED_PROPERTIES_HASH,
  HERO_FEATURED_PROPERTIES_PROGRESS,
  HERO_SCROLL_RESET_EVENT,
} from "@/lib/hero-featured-scroll"

let activeFrame = 0

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getSiteHeaderOffset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--site-header-height")
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : 80
}

function durationForDistance(distance: number) {
  return Math.min(1400, Math.max(750, Math.abs(distance) * 0.55))
}

export function cancelSmoothScroll() {
  cancelAnimationFrame(activeFrame)
  activeFrame = 0
}

export function smoothScrollTo(
  targetY: number,
  options?: {
    duration?: number
    onComplete?: () => void
  },
) {
  cancelSmoothScroll()

  const startY = window.scrollY
  const distance = targetY - startY

  if (Math.abs(distance) < 2) {
    options?.onComplete?.()
    return Promise.resolve()
  }

  if (prefersReducedMotion()) {
    window.scrollTo(0, targetY)
    options?.onComplete?.()
    return Promise.resolve()
  }

  const duration = options?.duration ?? durationForDistance(distance)
  const startTime = performance.now()

  return new Promise<void>((resolve) => {
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = easeInOutCubic(progress)
      window.scrollTo(0, startY + distance * eased)

      if (progress < 1) {
        activeFrame = requestAnimationFrame(step)
        return
      }

      activeFrame = 0
      options?.onComplete?.()
      resolve()
    }

    activeFrame = requestAnimationFrame(step)
  })
}

export function smoothScrollToHeroFeatured() {
  const section = document.getElementById("propiedades")
  if (!section) return Promise.resolve(false)

  const distance = section.offsetHeight - window.innerHeight
  if (distance <= 0) return Promise.resolve(false)

  const sectionTop = section.getBoundingClientRect().top + window.scrollY
  const targetY = sectionTop + HERO_FEATURED_PROPERTIES_PROGRESS * distance

  return smoothScrollTo(targetY).then(() => {
    window.history.replaceState(null, "", `#${HERO_FEATURED_PROPERTIES_HASH}`)
    return true
  })
}

export function smoothScrollToSection(sectionId: string) {
  if (sectionId === "propiedades" || sectionId === HERO_FEATURED_PROPERTIES_HASH) {
    return smoothScrollToHeroFeatured()
  }

  const element = document.getElementById(sectionId)
  if (!element) return Promise.resolve(false)

  const offset = getSiteHeaderOffset() + 12
  const targetY = element.getBoundingClientRect().top + window.scrollY - offset

  return smoothScrollTo(Math.max(0, targetY)).then(() => {
    window.history.replaceState(null, "", `#${sectionId}`)
    return true
  })
}

export function smoothScrollToHome() {
  return smoothScrollTo(0).then(() => {
    window.history.replaceState(null, "", "/")
    window.dispatchEvent(new CustomEvent(HERO_SCROLL_RESET_EVENT))
    return true
  })
}
