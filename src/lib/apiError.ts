import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

export function getErrorMessage(err: unknown, fallback = 'Error inesperado'): string {
  const axiosErr = err as AxiosError<ApiError>
  return axiosErr.response?.data?.message ?? (err as Error).message ?? fallback
}
