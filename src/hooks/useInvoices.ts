import { useState, useEffect, useCallback, useMemo } from 'react'
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
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([])
  const [backendTotal, setBackendTotal] = useState(0)
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

    // When a date range is active we fetch a large batch and paginate in memory,
    // because the backend does not support fechaDesde / fechaHasta params.
    const { fechaDesde, fechaHasta } = filters
    const hasDate = !!fechaDesde || !!fechaHasta
    const params: InvoiceFilters = hasDate
      ? { ...filters, page: undefined, pageSize: 500 }
      : { ...filters, page, pageSize: PAGE_SIZE }

    invoicesService
      .getAll(params)
      .then((res) => {
        if (!cancelled) {
          setAllInvoices(res.data)
          setBackendTotal(res.total)
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

  // Date filter applied in memory — no extra network call.
  const { fechaDesde, fechaHasta } = filters
  const hasDateFilter = !!fechaDesde || !!fechaHasta

  const filteredInvoices = useMemo(() => {
    if (!hasDateFilter) return allInvoices
    return allInvoices.filter((inv) => {
      const fecha = inv.fechaEmision.slice(0, 10) // YYYY-MM-DD from ISO string
      if (fechaDesde && fecha < fechaDesde) return false
      if (fechaHasta && fecha > fechaHasta) return false
      return true
    })
  }, [allInvoices, fechaDesde, fechaHasta, hasDateFilter])

  const invoices = hasDateFilter
    ? filteredInvoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : allInvoices

  const total = hasDateFilter ? filteredInvoices.length : backendTotal

  return { invoices, total, loading, error, page, pageSize: PAGE_SIZE, filters, setPage, setFilters, refresh }
}
