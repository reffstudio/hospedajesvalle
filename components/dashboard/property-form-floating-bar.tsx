"use client"

type PropertyFormFloatingBarProps = {
  mode: "create" | "edit"
  onPreview: () => void
}

export function PropertyFormFloatingBar({ mode, onPreview }: PropertyFormFloatingBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-valle-sage-200/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <button type="button" className="dashboard-btn-secondary min-w-[7.5rem]" onClick={onPreview}>
          Preview
        </button>
        <button type="submit" form="property-form" className="dashboard-btn-primary min-w-[10rem]">
          {mode === "create" ? "Crear propiedad" : "Guardar cambios"}
        </button>
      </div>
    </div>
  )
}
