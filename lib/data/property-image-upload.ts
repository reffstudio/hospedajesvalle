import { env } from "@/lib/config/env"
import type { PropertyImageUploadService } from "@/lib/data/repository.types"

const LOCAL_UPLOAD_PREFIX = "local"

/**
 * Dev-only upload: returns a blob URL. Not persisted across reloads.
 * Replace with SupabasePropertyImageUploadService when connecting Storage.
 */
export const localPropertyImageUploadService: PropertyImageUploadService = {
  async upload(file, propertyId) {
    const storagePath = `${LOCAL_UPLOAD_PREFIX}/${propertyId}/${crypto.randomUUID()}-${file.name}`
    return {
      url: URL.createObjectURL(file),
      storagePath,
    }
  },

  async remove(_storagePath) {
    // Blob URLs are revoked by the browser when the page unloads.
  },
}

export function getPropertyImageUploadService(): PropertyImageUploadService {
  if (env.dataProvider === "supabase") {
    throw new Error(
      "Supabase image upload is not implemented yet. Implement SupabasePropertyImageUploadService in lib/supabase/storage/property-images.ts.",
    )
  }

  return localPropertyImageUploadService
}
