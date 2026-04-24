import { useState, useEffect, useCallback } from 'react'
import type { DashboardData } from '@/pages/Dashboard/dashboardCalc'
import { calcDashboardData } from '@/pages/Dashboard/dashboardCalc'
import { invoicesService } from '@/services/api/invoices'
import { ordersService } from '@/services/api/orders'
import { usersService } from '@/services/api/users'
import { getErrorMessage } from '@/lib/apiError'

interface UseDashboardReturn {
  data: DashboardData | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.allSettled([
      invoicesService.getAll({ pageSize: 500 }),
      ordersService.getAll({ pageSize: 500 }),
      ordersService.getPendientesFacturacion(),
      usersService.getAll({ pageSize: 100 }),
    ]).then(([invRes, ordRes, pendRes, usersRes]) => {
      if (cancelled) return

      // All failed → show generic error
      const allFailed = [invRes, ordRes, pendRes, usersRes].every(
        (r) => r.status === 'rejected'
      )
      if (allFailed) {
        const firstErr = invRes.status === 'rejected' ? invRes.reason : null
        setError(getErrorMessage(firstErr, 'No se pudieron cargar los datos del dashboard'))
        setLoading(false)
        return
      }

      const invoices = invRes.status === 'fulfilled' ? invRes.value.data : []
      const orders = ordRes.status === 'fulfilled' ? ordRes.value.data : []
      const pendientes = pendRes.status === 'fulfilled' ? pendRes.value : []
      const users = usersRes.status === 'fulfilled' ? usersRes.value.data : []

      setData(calcDashboardData(invoices, orders, pendientes, users))
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [tick])

  return { data, loading, error, refresh }
}
