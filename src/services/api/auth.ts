import type { LoginCredentials, LoginResponse } from '@/types'
import { apiClient } from './client'

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Mock local activo cuando VITE_USE_MOCK_AUTH=true (desarrollo sin backend)
    if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      if (credentials.email === 'admin@rjma.com' && credentials.password === 'admin123') {
        return {
          token: 'mock-jwt-token-dev',
          user: { id: '1', email: 'admin@rjma.com', name: 'Administrador', role: 'ADMIN' },
        }
      }
      throw new Error('Credenciales incorrectas')
    }

    // Llamada real al backend
    // PROVISIONAL: el endpoint y la forma del response deben verificarse
    // contra la implementación real. Se normalizan los campos más comunes.
    const { data } = await apiClient.post<Record<string, unknown>>('/auth/login', credentials)
    return {
      token: (data.token ?? data.access_token) as string,
      user: {
        id: String((data.user as Record<string, unknown>)?.id ?? data.id),
        email: (data.user as Record<string, unknown>)?.email as string ?? credentials.email,
        name: ((data.user as Record<string, unknown>)?.nombre ?? (data.user as Record<string, unknown>)?.name) as string,
        role: 'ADMIN',
      },
    }
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout').catch(() => {})
  },
}
