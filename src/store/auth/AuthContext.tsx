import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AuthState, User, LoginCredentials } from '@/types'
import { authService } from '@/services/api/auth'
import { STORAGE_KEYS } from '@/lib/storage'

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadFromStorage(): { token: string | null; user: User | null } {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    const raw = localStorage.getItem(STORAGE_KEYS.USER)
    const user = raw ? (JSON.parse(raw) as User) : null
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = loadFromStorage()

  const [token, setToken] = useState<string | null>(stored.token)
  const [user, setUser] = useState<User | null>(stored.user)

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials)
    localStorage.setItem(STORAGE_KEYS.TOKEN, response.token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))
    setToken(response.token)
    setUser(response.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    setToken(null)
    setUser(null)
    // Fire-and-forget: invalida el token en servidor si el backend lo soporta
    authService.logout().catch(() => {})
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
