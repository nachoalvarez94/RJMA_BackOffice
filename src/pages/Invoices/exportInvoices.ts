import type { Invoice } from '@/types'
import { buildCsv, downloadCsv, numEs } from '@/lib/exportCsv'

const HEADERS = [
  'Nº Factura',
  'Nombre factura',
  'Fecha emisión',
  'Cliente',
  'Doc. fiscal',
  'Base imponible',
  'IVA',
  'Total',
  'Estado',
  'Pedido',
  'Archivo PDF',
]

/** Convierte ISO YYYY-MM-DD... a DD/MM/YYYY sin depender de Intl */
function isoToDDMMYYYY(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function invoiceRow(inv: Invoice): (string | number | null | undefined)[] {
  return [
    inv.numeroFactura,
    inv.pdfFileName ?? `FAC-${inv.numeroFactura}`,
    isoToDDMMYYYY(inv.fechaEmision),
    inv.nombreCliente?.trim() ?? '',
    inv.documentoFiscalCliente?.trim() ?? '',
    numEs(inv.baseImponible),
    numEs(inv.impuestos),
    numEs(inv.total),
    inv.estado,
    `#${inv.pedidoId}`,
    inv.pdfFileName ?? '',
  ]
}

/**
 * Genera y descarga un CSV de las facturas recibidas.
 * Nombre del fichero: facturas-YYYY-MM-DD.csv
 */
export function exportInvoicesToCsv(invoices: Invoice[]): void {
  const csv = buildCsv(HEADERS, invoices.map(invoiceRow))
  const today = new Date().toISOString().slice(0, 10)
  downloadCsv(csv, `facturas-${today}.csv`)
}
