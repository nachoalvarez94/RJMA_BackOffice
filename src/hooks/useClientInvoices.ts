import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Invoice } from '@/types'
import { invoicesService } from '@/services/api/invoices'
import { getErrorMessage } from '@/lib/apiError'

export interface DateRange {
  desde?: string  // YYYY-MM-DD
  hasta?: string  // YYYY-MM-DD
}

interface UseClientInvoicesReturn {
  invoices: Invoice[]
  loading: boolean
  error: string | null
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  refresh: () => void
}

// PROVISIONAL: carga todas las facturas del sistema (pageSize=500) y filtra
// en frontend por clienteId y rango de fechas, porque el backend no expone
// aún los parámetros ?clienteId ni ?fechaDesde/?fechaHasta.
//
// Endpoint ideal: GET /admin/facturas?clienteId={id}&fechaDesde=&fechaHasta=
// Cuando exista, mover el filtrado al servidor y eliminar esta carga global.
export function useClientInvoices(clienteId: number | null): UseClientInvoicesReturn {
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({})
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((n) => n + 1), [])

  // Fetch happens only when clienteId or tick changes — NOT on dateRange change
  useEffect(() => {
    if (!clienteId) {
      setAllInvoices([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    invoicesService
      .getAll({ pageSize: 500 })
      .then((res) => {
        if (!cancelled) {
          setAllInvoices(res.data)
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
  }, [clienteId, tick])

  // Filter in memory — no extra network request on date changes
  const invoices = useMemo(() => {
    return allInvoices
      .filter((i) => i.clienteId === clienteId)
      .filter((i) => {
        const fecha = i.fechaEmision.slice(0, 10) // 'YYYY-MM-DD' from ISO string
        if (dateRange.desde && fecha < dateRange.desde) return false
        if (dateRange.hasta && fecha > dateRange.hasta) return false
        return true
      })
  }, [allInvoices, clienteId, dateRange.desde, dateRange.hasta])

  return { invoices, loading, error, dateRange, setDateRange, refresh }
}
