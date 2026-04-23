import axios from 'axios'
import { STORAGE_KEYS } from '@/lib/storage'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

if (import.meta.env.DEV) {
  apiClient.interceptors.response.use(
    (response) => {
      if (response.config.url?.includes('/admin/') || response.config.url?.includes('/auth/')) {
        console.group(`[RJMA API] ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`)
        console.log('Raw data:', response.data)
        console.groupEnd()
      }
      return response
    },
    (error) => {
      const cfg = error.config
      console.group(`[RJMA API] ERROR ${cfg?.method?.toUpperCase()} ${cfg?.url}`)
      console.log('Status:', error.response?.status)
      console.log('Body:', error.response?.data)
      console.log('Message:', error.message)
      console.groupEnd()
      return Promise.reject(error)
    }
  )
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
