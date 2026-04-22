import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

export function getErrorMessage(err: unknown, fallback = 'Error inesperado'): string {
  const axiosErr = err as AxiosError<ApiError & Record<string, unknown>>
  const status = axiosErr.response?.status
  const data = axiosErr.response?.data

  // Mensaje del backend (distintos campos posibles)
  const backendMessage =
    (data as Record<string, unknown>)?.message ??
    (data as Record<string, unknown>)?.error ??
    (data as Record<string, unknown>)?.detail

  if (backendMessage && typeof backendMessage === 'string') {
    return status ? `[${status}] ${backendMessage}` : backendMessage
  }

  // Error de red (sin respuesta del servidor)
  if (axiosErr.code === 'ERR_NETWORK' || axiosErr.message === 'Network Error') {
    return 'No se pudo conectar con el servidor. Verifica que el backend esté accesible.'
  }

  if (status) {
    return `Error ${status}: ${axiosErr.message ?? fallback}`
  }

  return (err as Error).message ?? fallback
}
