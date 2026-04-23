import type { AxiosError, AxiosResponse } from 'axios'
import type { Invoice, BulkInvoiceResult, PaginatedResponse } from '@/types'
import { normalizePaginatedResponse } from '@/lib/apiUtils'
import { downloadBlob, extractFilename } from '@/lib/downloadBlob'
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

  async downloadPdf(id: number): Promise<void> {
    let response: AxiosResponse<Blob>
    try {
      response = await apiClient.get(`/admin/facturas/${id}/pdf`, { responseType: 'blob' })
    } catch (err) {
      // Con responseType:'blob' los errores HTTP llegan con data:Blob en vez de JSON.
      // Intentamos leer el cuerpo como texto para extraer el mensaje del backend.
      const axiosErr = err as AxiosError
      if (axiosErr.response?.data instanceof Blob) {
        const status = axiosErr.response.status
        try {
          const text = await (axiosErr.response.data as Blob).text()
          const json = JSON.parse(text) as Record<string, unknown>
          const msg = String(json.message ?? json.error ?? json.detail ?? '')
          if (msg) throw new Error(`[${status}] ${msg}`)
        } catch (inner) {
          if (inner instanceof Error && /^\[\d+\]/.test(inner.message)) throw inner
        }
        if (status === 403) throw new Error('No tienes permiso para descargar este PDF')
        if (status === 404) throw new Error('PDF no encontrado en el servidor')
        throw new Error(`Error ${status} al descargar el PDF`)
      }
      throw err
    }
    const disposition = response.headers['content-disposition'] as string | undefined
    const filename = extractFilename(disposition ?? null, `factura-${id}.pdf`)
    downloadBlob(response.data, filename)
  },
}
