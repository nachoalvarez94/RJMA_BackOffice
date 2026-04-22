import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/store/auth/AuthContext'

export function PrivateRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
