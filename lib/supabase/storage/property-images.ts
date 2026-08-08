import type { SupabaseClient } from "@supabase/supabase-js"
import { env } from "@/lib/config/env"
import type { PropertyImageUploadService } from "@/lib/data/repository.types"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-")
}

export async function uploadPropertyImageFile(
  supabase: SupabaseClient,
  file: File,
  propertyId: string,
) {
  const filename = sanitizeFilename(file.name || "image.jpg")
  const storagePath = `${propertyId}/${crypto.randomUUID()}-${filename}`

  const { error } = await supabase.storage
    .from(env.storage.propertyImagesBucket)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    })

  if (error) {
    const hint =
      error.message.includes("row-level security") || error.message.includes("RLS")
        ? " Ejecuta supabase/storage-policies.sql en el SQL Editor de Supabase."
        : ""
    throw new Error(`[uploadPropertyImageFile] ${error.message}${hint}`)
  }

  const { data } = supabase.storage.from(env.storage.propertyImagesBucket).getPublicUrl(storagePath)

  return {
    url: data.publicUrl,
    storagePath,
  }
}

export async function removePropertyImageFile(supabase: SupabaseClient, storagePath: string) {
  const { error } = await supabase.storage.from(env.storage.propertyImagesBucket).remove([storagePath])
  if (error) {
    throw new Error(`[removePropertyImageFile] ${error.message}`)
  }
}

export class SupabasePropertyImageUploadService implements PropertyImageUploadService {
  async upload(file: File, propertyId: string) {
    const supabase = getSupabaseBrowserClient()
    return uploadPropertyImageFile(supabase, file, propertyId)
  }

  async remove(storagePath: string) {
    const supabase = getSupabaseBrowserClient()
    await removePropertyImageFile(supabase, storagePath)
  }
}
