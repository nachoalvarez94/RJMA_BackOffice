export type EstadoPedido = 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO' | 'FACTURADO' | 'BORRADOR'
export type EstadoCobro = 'PENDIENTE' | 'PARCIAL' | 'COMPLETO'

export interface OrderLine {
  id?: number
  articuloId?: number
  nombreArticulo: string
  cantidad: number
  precioUnitario: number
  descuento: number
  subtotal: number
  totalLinea: number
}

export interface OrderUpdateLine {
  articuloId: number
  cantidad: number
  descuento?: number
}

export interface OrderUpdateRequest {
  clienteId?: number
  observaciones?: string
  importeCobrado?: number
  lineas: OrderUpdateLine[]
}

export interface Order {
  id: number
  numero: number
  clienteId: number
  creadoPorId: number
  fecha: string
  estado: EstadoPedido
  estadoCobro?: EstadoCobro
  facturable: boolean
  totalBruto: number
  totalDescuento: number
  totalFinal: number
  importeCobrado: number
  importePendiente: number
  observaciones?: string | null
  lineas?: OrderLine[]
  updatedAt?: string
}
