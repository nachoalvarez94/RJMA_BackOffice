// AdminUser = usuarios gestionados en el panel.
// Distinto de User (src/types/auth.ts) que es el usuario de sesión.
// PROVISIONAL: ajustar si el contrato real difiere.
export type RolUsuario = 'ADMIN' | 'USER'

export interface AdminUser {
  id: string
  nombre: string
  email: string
  rol: RolUsuario
  activo: boolean
  ultimoAcceso?: string
  creadoEn: string
}

export interface CreateUserDto {
  nombre: string
  email: string
  password: string
  rol: RolUsuario
}

export interface UpdateUserDto {
  nombre?: string
  email?: string
}

export interface ChangeRolDto {
  rol: RolUsuario
}
