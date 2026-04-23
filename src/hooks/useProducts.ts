import { useState, useEffect, useCallback } from 'react'
import type { Product } from '@/types'
import { productsService, type ProductFilters } from '@/services/api/products'
import { getErrorMessage } from '@/lib/apiError'

interface UseProductsReturn {
  products: Product[]
  total: number
  loading: boolean
  error: string | null
  page: number
  pageSize: number
  filters: ProductFilters
  setPage: (page: number) => void
  setFilters: (filters: ProductFilters) => void
  refresh: () => void
}

const PAGE_SIZE = 20

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPageState] = useState(1)
  const [filters, setFiltersState] = useState<ProductFilters>({})
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((n) => n + 1), [])
  const setPage = useCallback((p: number) => setPageState(p), [])
  const setFilters = useCallback((f: ProductFilters) => {
    setFiltersState(f)
    setPageState(1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    productsService
      .getAll({ ...filters, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (!cancelled) {
          setProducts(res.data)
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

  return { products, total, loading, error, page, pageSize: PAGE_SIZE, filters, setPage, setFilters, refresh }
}
