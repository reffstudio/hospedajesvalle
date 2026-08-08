import { env } from "@/lib/config/env"
import type { PropertyImageUploadService } from "@/lib/data/repository.types"
import { localPropertyImageUploadService } from "@/lib/data/property-image-upload.local"
import { SupabasePropertyImageUploadService } from "@/lib/supabase/storage/property-images"

export function getPropertyImageUploadService(): PropertyImageUploadService {
  if (env.dataProvider === "supabase") {
    return new SupabasePropertyImageUploadService()
  }

  return localPropertyImageUploadService
}
