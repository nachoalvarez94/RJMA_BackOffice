import { useState, useEffect, useCallback } from 'react'
import type { Invoice } from '@/types'
import { invoicesService, type InvoiceFilters } from '@/services/api/invoices'
import { getErrorMessage } from '@/lib/apiError'

interface UseInvoicesReturn {
  invoices: Invoice[]
  total: number
  loading: boolean
  error: string | null
  page: number
  pageSize: number
  filters: InvoiceFilters
  setPage: (page: number) => void
  setFilters: (filters: InvoiceFilters) => void
  refresh: () => void
}

const PAGE_SIZE = 20

export function useInvoices(): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPageState] = useState(1)
  const [filters, setFiltersState] = useState<InvoiceFilters>({})
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((n) => n + 1), [])
  const setPage = useCallback((p: number) => setPageState(p), [])
  const setFilters = useCallback((f: InvoiceFilters) => {
    setFiltersState(f)
    setPageState(1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    invoicesService
      .getAll({ ...filters, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (!cancelled) {
          setInvoices(res.data)
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

  return { invoices, total, loading, error, page, pageSize: PAGE_SIZE, filters, setPage, setFilters, refresh }
}
