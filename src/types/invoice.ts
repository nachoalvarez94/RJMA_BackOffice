// PROVISIONAL: ajustar si el contrato real difiere.
export type EstadoFactura = 'PENDIENTE' | 'PAGADA' | 'VENCIDA' | 'ANULADA'

export interface Invoice {
  id: string
  numeroFactura: string
  clienteId: string
  clienteNombre: string
  pedidoId?: string
  numeroPedido?: string
  fecha: string
  importeTotal: number
  estado: EstadoFactura
}

export interface BulkInvoiceResult {
  total: number
  exitosos: number
  fallidos: number
  facturasGeneradas: Invoice[]
  errores: Array<{ pedidoId: string; motivo: string }>
}
