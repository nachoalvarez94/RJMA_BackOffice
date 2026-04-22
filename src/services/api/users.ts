import type { AdminUser, CreateUserDto, UpdateUserDto, ChangeRolDto, PaginatedResponse } from '@/types'
import { apiClient } from './client'

export interface UserFilters {
  nombre?: string
  activo?: boolean
  page?: number
  pageSize?: number
}

export const usersService = {
  async getAll(filters: UserFilters = {}): Promise<PaginatedResponse<AdminUser>> {
    const { data } = await apiClient.get<PaginatedResponse<AdminUser>>('/admin/usuarios', { params: filters })
    return data
  },

  async getById(id: string): Promise<AdminUser> {
    const { data } = await apiClient.get<AdminUser>(`/admin/usuarios/${id}`)
    return data
  },

  async create(dto: CreateUserDto): Promise<AdminUser> {
    const { data } = await apiClient.post<AdminUser>('/admin/usuarios', dto)
    return data
  },

  async update(id: string, dto: UpdateUserDto): Promise<AdminUser> {
    const { data } = await apiClient.put<AdminUser>(`/admin/usuarios/${id}`, dto)
    return data
  },

  async changeRol(id: string, dto: ChangeRolDto): Promise<AdminUser> {
    const { data } = await apiClient.patch<AdminUser>(`/admin/usuarios/${id}/rol`, dto)
    return data
  },

  async activar(id: string): Promise<AdminUser> {
    const { data } = await apiClient.patch<AdminUser>(`/admin/usuarios/${id}/activar`)
    return data
  },

  async desactivar(id: string): Promise<AdminUser> {
    const { data } = await apiClient.patch<AdminUser>(`/admin/usuarios/${id}/desactivar`)
    return data
  },
}
