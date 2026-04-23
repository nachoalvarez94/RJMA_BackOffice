import type { PaginatedResponse } from '@/types'

/**
 * Normalizes any common paginated (or plain array) response from the backend
 * into the PaginatedResponse<T> shape the frontend expects.
 *
 * Handles:
 *   - Plain array T[]
 *   - { data, total, page, pageSize }           — current frontend assumption
 *   - { content, totalElements, number, size }  — Spring Boot / JPA Page<T>
 *   - { results, count }                         — Django REST Framework
 *   - { items, total }                           — generic
 */
export function normalizePaginatedResponse<T>(raw: unknown): PaginatedResponse<T> {
  if (Array.isArray(raw)) {
    return { data: raw as T[], total: raw.length, page: 1, pageSize: raw.length }
  }

  const obj = raw as Record<string, unknown>

  const items = (
    (Array.isArray(obj.data)    ? obj.data    : null) ??
    (Array.isArray(obj.content) ? obj.content : null) ??
    (Array.isArray(obj.results) ? obj.results : null) ??
    (Array.isArray(obj.items)   ? obj.items   : null) ??
    []
  ) as T[]

  const total: number =
    (typeof obj.total         === 'number' ? obj.total         : null) ??
    (typeof obj.totalElements === 'number' ? obj.totalElements : null) ??
    (typeof obj.count         === 'number' ? obj.count         : null) ??
    items.length

  // Spring uses 0-based page index; we use 1-based
  const page: number =
    (typeof obj.page   === 'number' ? obj.page              : null) ??
    (typeof obj.number === 'number' ? (obj.number as number) + 1 : null) ??
    1

  const pageSize: number =
    (typeof obj.pageSize === 'number' ? obj.pageSize : null) ??
    (typeof obj.size     === 'number' ? obj.size     : null) ??
    items.length

  return { data: items, total, page, pageSize }
}
