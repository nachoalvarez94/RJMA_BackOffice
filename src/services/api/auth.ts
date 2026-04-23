import type { LoginCredentials, LoginResponse } from '@/types'
import { apiClient } from './client'

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Mock local activo cuando VITE_USE_MOCK_AUTH=true (desarrollo sin backend)
    // Credenciales mock: username=admin / password=admin123
    if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        return {
          token: 'mock-jwt-token-dev',
          user: { id: '1', email: 'admin@rjma.com', name: 'Administrador', role: 'ADMIN' },
        }
      }
      throw new Error('Credenciales incorrectas')
    }

    // --- Diagnóstico (solo en desarrollo) ---
    if (import.meta.env.DEV) {
      console.group('[RJMA Auth] Login request')
      console.log('URL:', `${apiClient.defaults.baseURL}/auth/login`)
      console.log('Payload:', { username: credentials.username, password: '***' })
      console.groupEnd()
    }

    let rawData: Record<string, unknown>
    try {
      const { data } = await apiClient.post<Record<string, unknown>>('/auth/login', credentials)
      rawData = data

      if (import.meta.env.DEV) {
        console.group('[RJMA Auth] Login response OK')
        console.log('Raw response:', rawData)
        console.groupEnd()
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        const axiosErr = err as { response?: { status: number; data: unknown }; message: string }
        console.group('[RJMA Auth] Login response ERROR')
        console.log('Status:', axiosErr.response?.status)
        console.log('Body:', axiosErr.response?.data)
        console.log('Message:', axiosErr.message)
        console.groupEnd()
      }
      throw err
    }

    // Normalización defensiva — cubre los formatos más habituales de backends REST/Spring/NestJS
    const token =
      (rawData.token as string | undefined) ??
      (rawData.access_token as string | undefined) ??
      (rawData.accessToken as string | undefined)

    if (!token) {
      if (import.meta.env.DEV) {
        console.error('[RJMA Auth] No se encontró token en la respuesta. Campos recibidos:', Object.keys(rawData))
      }
      throw new Error('La respuesta del servidor no contiene un token reconocible.')
    }

    // El objeto usuario puede venir anidado en .user, o en el propio root
    const userObj = (rawData.user as Record<string, unknown> | undefined) ?? rawData

    return {
      token,
      user: {
        id: String(userObj.id ?? ''),
        email: (userObj.email as string | undefined) ?? '',
        name: ((userObj.nombre ?? userObj.name ?? userObj.username) as string | undefined) ?? credentials.username,
        role: 'ADMIN',
      },
    }
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout').catch(() => {})
  },
}
