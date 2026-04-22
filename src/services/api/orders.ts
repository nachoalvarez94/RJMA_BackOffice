import type { Order, PaginatedResponse } from '@/types'
import { apiClient } from './client'

export interface OrderFilters {
  clienteNombre?: string
  estado?: string
  page?: number
  pageSize?: number
}

export const ordersService = {
  async getAll(filters: OrderFilters = {}): Promise<PaginatedResponse<Order>> {
    const { data } = await apiClient.get<PaginatedResponse<Order>>('/admin/pedidos', { params: filters })
    return data
  },

  async getById(id: string): Promise<Order> {
    const { data } = await apiClient.get<Order>(`/admin/pedidos/${id}`)
    return data
  },

  // PROVISIONAL: este endpoint puede devolver un array directo sin paginación.
  // Se normaliza a PaginatedResponse para consistencia con la UI.
  async getPendientesFacturacion(): Promise<Order[]> {
    const { data } = await apiClient.get<Order[] | PaginatedResponse<Order>>(
      '/admin/pedidos/pendientes-facturacion'
    )
    if (Array.isArray(data)) return data
    return data.data
  },
}
