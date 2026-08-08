import type { PublicProperty } from "@/lib/properties/types"

const prefetched = new Set<string>()

export function prefetchPropertyImage(url: string) {
  if (!url || prefetched.has(url) || typeof window === "undefined") return
  prefetched.add(url)
  const img = new window.Image()
  img.src = url
}

export function prefetchPropertyImages(properties: Pick<PublicProperty, "image" | "quickLookImages">[]) {
  for (const property of properties) {
    prefetchPropertyImage(property.image)
    for (const image of property.quickLookImages ?? []) {
      prefetchPropertyImage(image)
    }
  }
}
