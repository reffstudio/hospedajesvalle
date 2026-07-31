"use client"

import Image from "next/image"
import { ArrowDown, ArrowUp, Star, Trash2, Upload } from "lucide-react"
import type { PropertyImage } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

type ImageGalleryEditorProps = {
  images: PropertyImage[]
  onChange: (images: PropertyImage[]) => void
}

function createImageId() {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ImageGalleryEditor({ images, onChange }: ImageGalleryEditorProps) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder)

  const updateImages = (next: PropertyImage[]) => {
    onChange(
      next.map((image, index) => ({
        ...image,
        sortOrder: index,
        isCover: index === 0,
      })),
    )
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    const additions = files.map((file, index) => ({
      id: createImageId(),
      url: URL.createObjectURL(file),
      sortOrder: sorted.length + index,
      isCover: sorted.length === 0 && index === 0,
    }))

    updateImages([...sorted, ...additions])
    event.target.value = ""
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= sorted.length) return
    const next = [...sorted]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    updateImages(next)
  }

  const remove = (id: string) => {
    updateImages(sorted.filter((image) => image.id !== id))
  }

  return (
    <div className="space-y-4">
      <label className="dashboard-upload-zone">
        <input type="file" accept="image/*" multiple className="sr-only" onChange={handleUpload} />
        <Upload className="mx-auto h-5 w-5 text-valle-forest-600" />
        <span className="mt-2 block text-sm font-medium text-valle-forest-800">Subir imágenes</span>
        <span className="mt-1 block text-xs text-valle-forest-500">
          La primera imagen será la portada. En producción se guardarán en Supabase Storage.
        </span>
      </label>

      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((image, index) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-2xl border border-valle-sage-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-valle-sage-100">
                <Image src={image.url} alt="" fill className="object-cover" unoptimized />
                {index === 0 ? (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-valle-forest-900/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                    <Star className="h-3 w-3" />
                    Portada
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-2 p-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className={cn("dashboard-icon-btn", index === 0 && "opacity-40")}
                    aria-label="Mover arriba"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === sorted.length - 1}
                    className={cn("dashboard-icon-btn", index === sorted.length - 1 && "opacity-40")}
                    aria-label="Mover abajo"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(image.id)}
                  className="dashboard-icon-btn text-valle-wine-700 hover:bg-valle-wine-50"
                  aria-label="Eliminar imagen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-valle-sage-300 px-4 py-6 text-sm text-valle-forest-500">
          Aún no hay imágenes para esta propiedad.
        </p>
      )}
    </div>
  )
}
