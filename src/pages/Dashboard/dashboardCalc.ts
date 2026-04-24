import type { Invoice, Order, AdminUser } from '@/types'

// ── Date helpers ─────────────────────────────────────────────────────────────

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function currentMonthRange(): [string, string] {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() // 0-based
  return [isoDate(new Date(y, m, 1)), isoDate(new Date(y, m + 1, 0))]
}

export function currentQuarterRange(): [string, string] {
  const now = new Date()
  const y = now.getFullYear()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  const starts = ['01-01', '04-01', '07-01', '10-01']
  const ends = ['03-31', '06-30', '09-30', '12-31']
  return [`${y}-${starts[q - 1]}`, `${y}-${ends[q - 1]}`]
}

function inRange(fechaISO: string, desde: string, hasta: string): boolean {
  const f = fechaISO.slice(0, 10)
  return f >= desde && f <= hasta
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface KpiBlock {
  count: number
  total: number
  base: number
  iva: number
}

export interface TopItem {
  nombre: string
  total: number
  count: number
}

export interface DashboardData {
  facturasMes: KpiBlock
  facturasTrimestre: KpiBlock
  pedidosPendientesFacturar: number
  pedidosPendientesCobro: number
  totalPendienteCobro: number
  ultimasFacturas: Invoice[]      // 5 most recent
  pendientesFacturacion: Order[]  // from dedicated endpoint
  topClientes: TopItem[]          // top 5 by total
  facturacionVendedor: TopItem[]  // all vendors sorted by total
}

// ── Main calculation ──────────────────────────────────────────────────────────

export function calcDashboardData(
  invoices: Invoice[],
  orders: Order[],
  pendientes: Order[],
  users: AdminUser[]
): DashboardData {
  const [mesDesde, mesHasta] = currentMonthRange()
  const [trimDesde, trimHasta] = currentQuarterRange()

  // KPIs from invoices
  const invMes = invoices.filter((i) => inRange(i.fechaEmision, mesDesde, mesHasta))
  const invTrim = invoices.filter((i) => inRange(i.fechaEmision, trimDesde, trimHasta))

  const kpiMes: KpiBlock = {
    count: invMes.length,
    total: invMes.reduce((s, i) => s + i.total, 0),
    base: invMes.reduce((s, i) => s + i.baseImponible, 0),
    iva: invMes.reduce((s, i) => s + i.impuestos, 0),
  }

  const kpiTrim: KpiBlock = {
    count: invTrim.length,
    total: invTrim.reduce((s, i) => s + i.total, 0),
    base: invTrim.reduce((s, i) => s + i.baseImponible, 0),
    iva: invTrim.reduce((s, i) => s + i.impuestos, 0),
  }

  // KPIs from orders
  const ordenesConDeuda = orders.filter(
    (o) => o.estadoCobro === 'PENDIENTE' || o.estadoCobro === 'PARCIAL'
  )
  const totalPendienteCobro = ordenesConDeuda.reduce((s, o) => s + o.importePendiente, 0)

  // 5 most recent invoices
  const ultimasFacturas = [...invoices]
    .sort((a, b) => b.fechaEmision.localeCompare(a.fechaEmision))
    .slice(0, 5)

  // Top 5 clients by total invoiced (all time)
  const clientMap = new Map<string, { total: number; count: number }>()
  for (const inv of invoices) {
    const nombre = inv.nombreCliente?.trim() || `Cliente #${inv.clienteId}`
    const cur = clientMap.get(nombre) ?? { total: 0, count: 0 }
    clientMap.set(nombre, { total: cur.total + inv.total, count: cur.count + 1 })
  }
  const topClientes = [...clientMap.entries()]
    .map(([nombre, v]) => ({ nombre, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  // Billing per vendor (AdminUser.id is string, emitidaPorId is number)
  const userNameMap = new Map(
    users.map((u) => [Number(u.id), u.nombre?.trim() || `#${u.id}`])
  )
  const vendedorMap = new Map<number, { nombre: string; total: number; count: number }>()
  for (const inv of invoices) {
    const nombre = userNameMap.get(inv.emitidaPorId) ?? `Vendedor #${inv.emitidaPorId}`
    const cur = vendedorMap.get(inv.emitidaPorId) ?? { nombre, total: 0, count: 0 }
    vendedorMap.set(inv.emitidaPorId, {
      nombre,
      total: cur.total + inv.total,
      count: cur.count + 1,
    })
  }
  const facturacionVendedor = [...vendedorMap.values()].sort((a, b) => b.total - a.total)

  return {
    facturasMes: kpiMes,
    facturasTrimestre: kpiTrim,
    pedidosPendientesFacturar: pendientes.length,
    pedidosPendientesCobro: ordenesConDeuda.length,
    totalPendienteCobro,
    ultimasFacturas,
    pendientesFacturacion: pendientes,
    topClientes,
    facturacionVendedor,
  }
}
