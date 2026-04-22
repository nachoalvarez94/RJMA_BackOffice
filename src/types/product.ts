// PROVISIONAL: ajustar si el contrato real difiere.
export interface Product {
  id: string
  nombre: string
  referencia: string
  precio: number
  descripcion?: string
  activo: boolean
  creadoEn: string
}

export interface CreateProductDto {
  nombre: string
  referencia: string
  precio: number
  descripcion?: string
}

export type UpdateProductDto = Partial<CreateProductDto>
