// PROVISIONAL: ajustar campos cuando se confirme el contrato con el backend.
export type ClientStatus = 'active' | 'inactive'

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  taxId?: string      // NIF / CIF
  status: ClientStatus
  createdAt: string
}

export interface CreateClientDto {
  name: string
  email: string
  phone?: string
  address?: string
  taxId?: string
}

export type UpdateClientDto = Partial<CreateClientDto> & { status?: ClientStatus }
