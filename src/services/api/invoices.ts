import type { Invoice, BulkInvoiceResult, PaginatedResponse } from '@/types'
import { normalizePaginatedResponse } from '@/lib/apiUtils'
import { apiClient } from './client'

export interface InvoiceFilters {
  clienteNombre?: string
  estado?: string
  page?: number
  pageSize?: number
}

export const invoicesService = {
  async getAll(filters: InvoiceFilters = {}): Promise<PaginatedResponse<Invoice>> {
    const { data } = await apiClient.get<unknown>('/admin/facturas', { params: filters })
    return normalizePaginatedResponse<Invoice>(data)
  },

  async getById(id: string): Promise<Invoice> {
    const { data } = await apiClient.get<Invoice>(`/admin/facturas/${id}`)
    return data
  },

  async desdePedido(pedidoId: string): Promise<Invoice> {
    const { data } = await apiClient.post<Invoice>(`/admin/facturas/desde-pedido/${pedidoId}`)
    return data
  },

  // PROVISIONAL: el body de /masiva no está definido — se envía vacío.
  // Ajustar si el backend requiere un payload (lista de pedidoIds, rango de fechas, etc.)
  async masiva(): Promise<BulkInvoiceResult> {
    const { data } = await apiClient.post<BulkInvoiceResult>('/admin/facturas/masiva')
    return data
  },
}
