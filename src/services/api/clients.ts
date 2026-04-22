import type { Client, CreateClientDto, UpdateClientDto, PaginatedResponse, PaginationParams } from '@/types'
import { apiClient } from './client'

export const clientsService = {
  async getAll(params: PaginationParams): Promise<PaginatedResponse<Client>> {
    const { data } = await apiClient.get<PaginatedResponse<Client>>('/clients', { params })
    return data
  },

  async getById(id: string): Promise<Client> {
    const { data } = await apiClient.get<Client>(`/clients/${id}`)
    return data
  },

  async create(dto: CreateClientDto): Promise<Client> {
    const { data } = await apiClient.post<Client>('/clients', dto)
    return data
  },

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const { data } = await apiClient.patch<Client>(`/clients/${id}`, dto)
    return data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/clients/${id}`)
  },
}
