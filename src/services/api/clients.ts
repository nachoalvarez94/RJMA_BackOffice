import type { Client, CreateClientDto, UpdateClientDto, PaginatedResponse } from '@/types'
import { normalizePaginatedResponse } from '@/lib/apiUtils'
import { apiClient } from './client'

export interface ClientFilters {
  nombre?: string
  activo?: boolean
  page?: number
  pageSize?: number
}

export const clientsService = {
  async getAll(filters: ClientFilters = {}): Promise<PaginatedResponse<Client>> {
    const { data } = await apiClient.get<unknown>('/admin/clientes', { params: filters })
    return normalizePaginatedResponse<Client>(data)
  },

  async getById(id: string): Promise<Client> {
    const { data } = await apiClient.get<Client>(`/admin/clientes/${id}`)
    return data
  },

  async create(dto: CreateClientDto): Promise<Client> {
    const { data } = await apiClient.post<Client>('/admin/clientes', dto)
    return data
  },

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const { data } = await apiClient.put<Client>(`/admin/clientes/${id}`, dto)
    return data
  },

  async activar(id: string): Promise<Client> {
    const { data } = await apiClient.patch<Client>(`/admin/clientes/${id}/activar`)
    return data
  },

  async desactivar(id: string): Promise<Client> {
    const { data } = await apiClient.patch<Client>(`/admin/clientes/${id}/desactivar`)
    return data
  },
}
