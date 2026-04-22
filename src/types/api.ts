// PROVISIONAL: estas estructuras asumen una convención REST concreta.
// Ajustar cuando se conozca la respuesta real del backend de RJMA.

export interface ApiError {
  message: string
  statusCode: number
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
