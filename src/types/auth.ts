// PROVISIONAL: role fijo en 'ADMIN'. Ampliar si el sistema gana más roles.
export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN'
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}
