/** Scroll progress in the hero pin where featured properties are fully visible. */
export const HERO_FEATURED_PROPERTIES_PROGRESS = 0.38

export const HERO_FEATURED_PROPERTIES_HASH = "propiedades-destacadas"

export const HERO_SCROLL_RESET_EVENT = "hero-scroll-reset"

export function scrollToHeroStart() {
  window.history.replaceState(null, "", "/")
  window.dispatchEvent(new CustomEvent(HERO_SCROLL_RESET_EVENT))
  window.scrollTo({ top: 0, behavior: "instant" })
}

export function scrollToHeroFeaturedProperties(behavior: ScrollBehavior = "smooth") {
  const section = document.getElementById("propiedades")
  if (!section) return false

  const distance = section.offsetHeight - window.innerHeight
  if (distance <= 0) return false

  const sectionTop = section.getBoundingClientRect().top + window.scrollY
  const targetY = sectionTop + HERO_FEATURED_PROPERTIES_PROGRESS * distance

  window.scrollTo({ top: targetY, behavior })
  window.history.replaceState(null, "", `#${HERO_FEATURED_PROPERTIES_HASH}`)
  return true
}
