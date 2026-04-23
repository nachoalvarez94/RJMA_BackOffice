import type { Invoice, BulkInvoiceResult, PaginatedResponse } from '@/types'
import { normalizePaginatedResponse } from '@/lib/apiUtils'
import { apiClient } from './client'

export interface InvoiceFilters {
  clienteNombre?: string
  clienteId?: number
  estado?: string
  fechaDesde?: string   // ISO date, e.g. '2026-01-01'
  fechaHasta?: string   // ISO date, e.g. '2026-12-31'
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

  async downloadPdf(id: number, filename?: string): Promise<void> {
    const response = await apiClient.get(`/admin/facturas/${id}/pdf`, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename ?? `factura-${id}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  // PROVISIONAL: el body de /masiva no está definido — se envía vacío.
  async masiva(): Promise<BulkInvoiceResult> {
    const { data } = await apiClient.post<BulkInvoiceResult>('/admin/facturas/masiva')
    return data
  },
}
