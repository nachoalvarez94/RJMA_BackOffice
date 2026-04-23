import { useState, useEffect, useCallback } from 'react'
import type { AdminUser } from '@/types'
import { usersService, type UserFilters } from '@/services/api/users'
import { getErrorMessage } from '@/lib/apiError'

interface UseUsersReturn {
  users: AdminUser[]
  total: number
  loading: boolean
  error: string | null
  page: number
  pageSize: number
  filters: UserFilters
  setPage: (page: number) => void
  setFilters: (filters: UserFilters) => void
  refresh: () => void
}

const PAGE_SIZE = 20

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPageState] = useState(1)
  const [filters, setFiltersState] = useState<UserFilters>({})
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((n) => n + 1), [])
  const setPage = useCallback((p: number) => setPageState(p), [])
  const setFilters = useCallback((f: UserFilters) => {
    setFiltersState(f)
    setPageState(1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    usersService
      .getAll({ ...filters, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (!cancelled) {
          setUsers(res.data)
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

  return { users, total, loading, error, page, pageSize: PAGE_SIZE, filters, setPage, setFilters, refresh }
}
