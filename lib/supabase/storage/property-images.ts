import type { PropertyImageUploadService } from "@/lib/data/repository.types"
import { env } from "@/lib/config/env"

/**
 * Uploads property images to Supabase Storage.
 * Implement when connecting the dashboard image gallery.
 */
export class SupabasePropertyImageUploadService implements PropertyImageUploadService {
  async upload(_file: File, _propertyId: string) {
    throw new Error(
      `Implement SupabasePropertyImageUploadService using bucket "${env.storage.propertyImagesBucket}".`,
    )
  }

  async remove(_storagePath: string) {
    throw new Error("Implement SupabasePropertyImageUploadService.remove().")
  }
}
