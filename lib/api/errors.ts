export const PUBLIC_API_ERRORS = {
  invalidRequest: "Solicitud inválida.",
  submitFailed: "No se pudo procesar la solicitud. Intenta de nuevo.",
  loadFailed: "No se pudieron cargar los datos.",
} as const

export function logServerError(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[${context}]`, message)
}
