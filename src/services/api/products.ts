import type { Product, CreateProductDto, UpdateProductDto, PaginatedResponse } from '@/types'
import { apiClient } from './client'

export interface ProductFilters {
  nombre?: string
  activo?: boolean
  page?: number
  pageSize?: number
}

export const productsService = {
  async getAll(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const { data } = await apiClient.get<PaginatedResponse<Product>>('/admin/productos', { params: filters })
    return data
  },

  async getById(id: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/admin/productos/${id}`)
    return data
  },

  async create(dto: CreateProductDto): Promise<Product> {
    const { data } = await apiClient.post<Product>('/admin/productos', dto)
    return data
  },

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const { data } = await apiClient.put<Product>(`/admin/productos/${id}`, dto)
    return data
  },

  async activar(id: string): Promise<Product> {
    const { data } = await apiClient.patch<Product>(`/admin/productos/${id}/activar`)
    return data
  },

  async desactivar(id: string): Promise<Product> {
    const { data } = await apiClient.patch<Product>(`/admin/productos/${id}/desactivar`)
    return data
  },
}
