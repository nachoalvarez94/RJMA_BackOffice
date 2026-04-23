import type { Invoice, BulkInvoiceResult, PaginatedResponse } from '@/types'
import { normalizePaginatedResponse } from '@/lib/apiUtils'
import { apiClient } from './client'

export interface InvoiceFilters {
  // Backend-confirmed params only.
  // clienteId, fechaDesde, fechaHasta are NOT confirmed — filter in frontend.
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
  async masiva(): Promise<BulkInvoiceResult> {
    const { data } = await apiClient.post<BulkInvoiceResult>('/admin/facturas/masiva')
    return data
  },

  // PDF DOWNLOAD — endpoint no confirmado en backend.
  // El endpoint esperado sería: GET /admin/facturas/{id}/pdf (devuelve blob).
  // Mientras no esté confirmado, esta función lanza error intencionalmente.
  // Confirmar con backend y descomentar la implementación real:
  //
  // async downloadPdf(id: number, filename?: string): Promise<void> {
  //   const response = await apiClient.get(`/admin/facturas/${id}/pdf`, { responseType: 'blob' })
  //   const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' })
  //   const url = URL.createObjectURL(blob)
  //   const a = document.createElement('a')
  //   a.href = url
  //   a.download = filename ?? `factura-${id}.pdf`
  //   document.body.appendChild(a)
  //   a.click()
  //   document.body.removeChild(a)
  //   URL.revokeObjectURL(url)
  // },
}
