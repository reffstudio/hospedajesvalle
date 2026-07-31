import type { DashboardProperty } from "@/lib/dashboard/types"

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function ensureUniquePropertySlug(
  baseSlug: string,
  properties: DashboardProperty[],
  excludeId?: string,
): string {
  const base = slugify(baseSlug) || "propiedad"
  const taken = new Set(
    properties.filter((property) => property.id !== excludeId).map((property) => property.id),
  )

  if (!taken.has(base)) return base

  let suffix = 2
  while (taken.has(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}
