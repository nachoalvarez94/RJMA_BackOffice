// Nombres de campo en español para coincidir con el backend RJMA.
// PROVISIONAL: ajustar si el contrato real difiere.
export interface Client {
  id: string
  nombre: string
  email: string
  telefono?: string
  direccion?: string
  nif?: string
  activo: boolean
  creadoEn: string
}

export interface CreateClientDto {
  nombre: string
  email: string
  telefono?: string
  direccion?: string
  nif?: string
}

export type UpdateClientDto = Partial<CreateClientDto>
