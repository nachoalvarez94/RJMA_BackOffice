import type { Order, OrderUpdateRequest, PaginatedResponse } from '@/types'
import { normalizePaginatedResponse } from '@/lib/apiUtils'
import { apiClient } from './client'

export interface OrderFilters {
  clienteNombre?: string
  estado?: string
  page?: number
  pageSize?: number
}

export const ordersService = {
  async getAll(filters: OrderFilters = {}): Promise<PaginatedResponse<Order>> {
    const { data } = await apiClient.get<unknown>('/admin/pedidos', { params: filters })
    return normalizePaginatedResponse<Order>(data)
  },

  async getById(id: string): Promise<Order> {
    const { data } = await apiClient.get<Order>(`/admin/pedidos/${id}`)
    return data
  },

  async update(id: number, payload: OrderUpdateRequest): Promise<Order> {
    const { data } = await apiClient.put<Order>(`/admin/pedidos/${id}`, payload)
    return data
  },

  async getPendientesFacturacion(): Promise<Order[]> {
    const { data } = await apiClient.get<unknown>('/admin/pedidos/pendientes-facturacion')
    return normalizePaginatedResponse<Order>(data).data
  },
}
