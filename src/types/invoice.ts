export type EstadoFactura = 'EMITIDA' | 'PAGADA' | 'VENCIDA' | 'ANULADA'

export interface InvoiceLine {
  id: number
  articuloId: number
  nombreArticulo: string
  codigoArticulo: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  tipoIva: number
  cuotaIva: number
  totalLinea: number
}

export interface Invoice {
  id: number
  numeroFactura: number
  clienteId: number
  nombreCliente: string
  documentoFiscalCliente?: string
  emailCliente?: string
  telefonoCliente?: string
  direccionCliente?: string
  emitidaPorId: number
  pedidoId: number
  estado: EstadoFactura
  fechaEmision: string
  baseImponible: number
  impuestos: number
  total: number
  pdfFileName?: string
  pdfGeneratedAt?: string
  pdfPath?: string
  pdfVersion?: number
  lineas?: InvoiceLine[]
}

export interface BulkInvoiceResult {
  total: number
  exitosos: number
  fallidos: number
  facturasGeneradas: Invoice[]
  errores: Array<{ pedidoId: number; motivo: string }>
}
