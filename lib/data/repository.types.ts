import type {
  CustomAmenityDefinition,
  DashboardProperty,
  DashboardPropertyInput,
} from "@/lib/dashboard/types"
import type { CustomAmenityIconId } from "@/lib/custom-amenity-icons"

/**
 * Dashboard data access contract.
 * LocalPropertyRepository (localStorage via property-store) is the current impl.
 * SupabasePropertyRepository should implement the same surface.
 */
export interface PropertyRepository {
  readonly isReady: boolean

  listProperties(): DashboardProperty[]
  listCustomAmenities(): CustomAmenityDefinition[]

  createProperty(input: DashboardPropertyInput): Promise<DashboardProperty> | DashboardProperty
  updateProperty(id: string, input: Partial<DashboardPropertyInput>): Promise<void> | void
  deleteProperty(id: string): Promise<void> | void
  reorderFeatured(orderedIds: string[]): Promise<void> | void

  addCustomAmenityDefinition(input: {
    label: string
    iconId: CustomAmenityIconId
  }): Promise<CustomAmenityDefinition> | CustomAmenityDefinition

  resetToSeed(): Promise<void> | void
}

export type ImageUploadResult = {
  url: string
  storagePath: string
}

/**
 * Image pipeline for dashboard uploads.
 * Local dev may use blob URLs; production uses Supabase Storage.
 */
export interface PropertyImageUploadService {
  upload(file: File, propertyId: string): Promise<ImageUploadResult>
  remove(storagePath: string): Promise<void>
}
