import type { CustomAmenityDefinition, DashboardProperty } from "@/lib/dashboard/types"
import type { PropertyImageRow, PropertyRow } from "@/lib/supabase/database.types"
import type { AmenityId } from "@/lib/property-amenities"

/**
 * Maps Supabase rows to DashboardProperty.
 * Implement when wiring fetchPublicPropertiesFromSupabase.
 */
export type PropertyRowBundle = {
  property: PropertyRow
  images: PropertyImageRow[]
  amenities: AmenityId[]
  highlightAmenities: AmenityId[]
  customAmenityIds: string[]
  highlightCustomAmenities: string[]
  customAmenityCatalog: CustomAmenityDefinition[]
}

export function mapPropertyRowsToDashboard(_bundle: PropertyRowBundle): DashboardProperty {
  throw new Error("mapPropertyRowsToDashboard is not implemented yet.")
}
