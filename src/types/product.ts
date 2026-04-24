export type UnidadVenta = 'UNIDAD' | 'CAJA' | 'GRANEL' | 'PESO'

export interface Product {
  id: string
  activo: boolean
  nombre: string
  codigoInterno?: string
  codigoBarras?: string | null
  precio: number
  unidadVenta: UnidadVenta
}

export interface CreateProductDto {
  nombre: string
  codigoInterno?: string
  codigoBarras?: string | null
  precio: number
  activo?: boolean
  unidadVenta: UnidadVenta
}

export type UpdateProductDto = Partial<CreateProductDto>
