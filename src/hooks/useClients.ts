import { useState, useEffect, useCallback } from 'react'
import type { Client, PaginationParams } from '@/types'
import { clientsService } from '@/services/api/clients'

interface UseClientsState {
  clients: Client[]
  total: number
  loading: boolean
  error: string | null
}

interface UseClientsReturn extends UseClientsState {
  pagination: PaginationParams
  setPagination: (p: PaginationParams) => void
  refresh: () => void
}

const DEFAULT_PAGINATION: PaginationParams = { page: 1, pageSize: 20 }

export function useClients(): UseClientsReturn {
  const [state, setState] = useState<UseClientsState>({
    clients: [],
    total: 0,
    loading: false,
    error: null,
  })
  const [pagination, setPagination] = useState<PaginationParams>(DEFAULT_PAGINATION)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false

    setState((prev) => ({ ...prev, loading: true, error: null }))

    clientsService
      .getAll(pagination)
      .then((res) => {
        if (!cancelled) {
          setState({ clients: res.data, total: res.total, loading: false, error: null })
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false, error: err.message }))
        }
      })

    return () => {
      cancelled = true
    }
  }, [pagination, tick])

  return { ...state, pagination, setPagination, refresh }
}
