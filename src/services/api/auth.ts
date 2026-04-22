import type { LoginCredentials, LoginResponse } from '@/types'
import { apiClient } from './client'

// Stub para desarrollo local — reemplazar con llamada real al backend
const MOCK_ADMIN: LoginResponse = {
  token: 'mock-jwt-token-dev',
  user: {
    id: '1',
    email: 'admin@rjma.com',
    name: 'Administrador',
    role: 'ADMIN',
  },
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // TODO: reemplazar mock por llamada real
    // const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials)
    // return data

    // Mock de desarrollo
    if (
      credentials.email === 'admin@rjma.com' &&
      credentials.password === 'admin123'
    ) {
      return Promise.resolve(MOCK_ADMIN)
    }
    return Promise.reject(new Error('Credenciales incorrectas'))
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout').catch(() => {})
  },
}
