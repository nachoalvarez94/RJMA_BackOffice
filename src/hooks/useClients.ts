import { useState, useEffect, useCallback } from 'react'
import type { Client } from '@/types'
import { clientsService, type ClientFilters } from '@/services/api/clients'
import { getErrorMessage } from '@/lib/apiError'

interface UseClientsReturn {
  clients: Client[]
  total: number
  loading: boolean
  error: string | null
  page: number
  pageSize: number
  filters: ClientFilters
  setPage: (page: number) => void
  setFilters: (filters: ClientFilters) => void
  refresh: () => void
}

const PAGE_SIZE = 20

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPageState] = useState(1)
  const [filters, setFiltersState] = useState<ClientFilters>({})
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((n) => n + 1), [])

  const setPage = useCallback((p: number) => setPageState(p), [])

  const setFilters = useCallback((f: ClientFilters) => {
    setFiltersState(f)
    setPageState(1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    clientsService
      .getAll({ ...filters, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (!cancelled) {
          setClients(res.data)
          setTotal(res.total)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err))
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [filters, page, tick])

  return { clients, total, loading, error, page, pageSize: PAGE_SIZE, filters, setPage, setFilters, refresh }
}
