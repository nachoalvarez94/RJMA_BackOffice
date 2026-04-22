// PROVISIONAL: ajustar si el contrato real difiere.
export type EstadoPedido = 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO' | 'FACTURADO'

export interface OrderLine {
  id: string
  productoId: string
  productoNombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Order {
  id: string
  numeroPedido: string
  clienteId: string
  clienteNombre: string
  fecha: string
  total: number
  estado: EstadoPedido
  pendienteFacturacion: boolean
  lineas?: OrderLine[]
}
