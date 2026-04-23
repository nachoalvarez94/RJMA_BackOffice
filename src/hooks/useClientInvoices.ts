import { useState, useEffect, useCallback } from 'react'
import type { Invoice } from '@/types'
import { invoicesService } from '@/services/api/invoices'
import { getErrorMessage } from '@/lib/apiError'

interface DateRange {
  desde?: string
  hasta?: string
}

interface UseClientInvoicesReturn {
  invoices: Invoice[]
  loading: boolean
  error: string | null
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  refresh: () => void
}

// PROVISIONAL: carga todas las facturas del cliente sin paginación (pageSize=200).
// Asume que un cliente no tendrá más de 200 facturas. Si se necesita paginación,
// añadir al estado page/pageSize y exponer setPage.
export function useClientInvoices(clienteId: number | null): UseClientInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({})
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!clienteId) {
      setInvoices([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setInvoices([])

    invoicesService
      .getAll({
        clienteId,
        fechaDesde: dateRange.desde,
        fechaHasta: dateRange.hasta,
        pageSize: 200,
      })
      .then((res) => {
        if (!cancelled) {
          setInvoices(res.data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err))
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [clienteId, dateRange.desde, dateRange.hasta, tick])

  return { invoices, loading, error, dateRange, setDateRange, refresh }
}
