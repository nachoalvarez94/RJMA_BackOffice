import { useState, useEffect, useCallback } from 'react'
import type { Order } from '@/types'
import { ordersService, type OrderFilters } from '@/services/api/orders'
import { getErrorMessage } from '@/lib/apiError'

interface UseOrdersReturn {
  orders: Order[]
  total: number
  loading: boolean
  error: string | null
  page: number
  pageSize: number
  filters: OrderFilters
  setPage: (page: number) => void
  setFilters: (filters: OrderFilters) => void
  refresh: () => void
}

interface UsePendientesReturn {
  orders: Order[]
  loading: boolean
  error: string | null
  refresh: () => void
}

const PAGE_SIZE = 20

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPageState] = useState(1)
  const [filters, setFiltersState] = useState<OrderFilters>({})
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((n) => n + 1), [])
  const setPage = useCallback((p: number) => setPageState(p), [])
  const setFilters = useCallback((f: OrderFilters) => {
    setFiltersState(f)
    setPageState(1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    ordersService
      .getAll({ ...filters, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (!cancelled) {
          setOrders(res.data)
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

  return { orders, total, loading, error, page, pageSize: PAGE_SIZE, filters, setPage, setFilters, refresh }
}

export function usePendientesFacturacion(): UsePendientesReturn {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    ordersService
      .getPendientesFacturacion()
      .then((data) => {
        if (!cancelled) {
          setOrders(data)
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
  }, [tick])

  return { orders, loading, error, refresh }
}
