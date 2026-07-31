"use client"

import { useState } from "react"
import { GripVertical, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

type PropertyIncludesEditorProps = {
  includes: string[]
  onChange: (value: string[]) => void
}

function reorderItems<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export function PropertyIncludesEditor({ includes, onChange }: PropertyIncludesEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  const updateItem = (index: number, value: string) => {
    onChange(includes.map((item, itemIndex) => (itemIndex === index ? value : item)))
  }

  const removeItem = (index: number) => {
    onChange(includes.filter((_, itemIndex) => itemIndex !== index))
  }

  const addItem = () => {
    onChange([...includes, ""])
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDropIndex(null)
      return
    }

    onChange(reorderItems(includes, draggedIndex, targetIndex))
    setDraggedIndex(null)
    setDropIndex(null)
  }

  return (
    <div className="space-y-3">
      {includes.length > 0 ? (
        <ul className="space-y-2">
          {includes.map((item, index) => (
            <li
              key={`include-${index}`}
              onDragOver={(event) => {
                event.preventDefault()
                setDropIndex(index)
              }}
              onDragLeave={() => {
                if (dropIndex === index) setDropIndex(null)
              }}
              onDrop={(event) => {
                event.preventDefault()
                handleDrop(index)
              }}
              className={cn(
                "flex items-center gap-2 rounded-xl border bg-white px-2 py-1.5 transition-colors",
                draggedIndex === index && "opacity-50",
                dropIndex === index && draggedIndex !== index
                  ? "border-valle-forest-500 bg-valle-sage-50"
                  : "border-valle-sage-200",
              )}
            >
              <button
                type="button"
                draggable
                className="dashboard-icon-btn shrink-0 cursor-grab touch-none text-valle-forest-500 active:cursor-grabbing"
                aria-label="Arrastrar para reordenar"
                onDragStart={(event) => {
                  setDraggedIndex(index)
                  event.dataTransfer.effectAllowed = "move"
                  event.dataTransfer.setData("text/plain", String(index))
                }}
                onDragEnd={() => {
                  setDraggedIndex(null)
                  setDropIndex(null)
                }}
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <span className="w-3 shrink-0 text-sm text-valle-forest-400">•</span>
              <input
                className="dashboard-input min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus:ring-0"
                value={item}
                onChange={(event) => updateItem(index, event.target.value)}
                placeholder="Ej. Check-in privado y llegada asistida"
              />
              <button
                type="button"
                className="dashboard-icon-btn shrink-0 text-valle-wine-700 hover:bg-valle-wine-50"
                aria-label="Eliminar bullet"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-valle-forest-500">No hay bullets. Agrega uno para mostrar la sección Incluye.</p>
      )}

      <button type="button" className="dashboard-btn-secondary inline-flex gap-2" onClick={addItem}>
        <Plus className="h-4 w-4" />
        Agregar bullet
      </button>
    </div>
  )
}
