export interface Product {
  id: string
  activo: boolean
  nombre: string
  codigoInterno?: string
  codigoBarras?: string | null
  precio: number
}

export interface CreateProductDto {
  nombre: string
  codigoInterno?: string
  codigoBarras?: string | null
  precio: number
  activo?: boolean
}

export type UpdateProductDto = Partial<CreateProductDto>
