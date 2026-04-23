export interface Client {
  id: string        // backend example didn't include id but it's required for CRUD
  activo: boolean
  nombre: string
  nombreComercio?: string
  documentoFiscal?: string
  telefono?: string
  direccion?: string
  poblacion?: string
}

export interface CreateClientDto {
  nombre: string
  nombreComercio?: string
  documentoFiscal?: string
  telefono?: string
  direccion?: string
  poblacion?: string
  activo?: boolean
}

export type UpdateClientDto = Partial<CreateClientDto>
