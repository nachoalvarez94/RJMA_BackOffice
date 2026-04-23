import { useEffect, useState } from 'react'
import { Modal, Descriptions, Table, Tag, Button, Popconfirm, message, Spin, Alert } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import type { Order, OrderLine } from '@/types'
import { ordersService } from '@/services/api/orders'
import { invoicesService } from '@/services/api/invoices'
import { useNameResolver } from '@/hooks/useNameResolver'
import { clientsService } from '@/services/api/clients'
import { usersService } from '@/services/api/users'
import { getErrorMessage } from '@/lib/apiError'
import { formatCurrency, formatDate } from '@/lib/format'

const ESTADO_COLORS: Record<string, string> = {
  BORRADOR: 'default',
  PENDIENTE: 'orange',
  COMPLETADO: 'green',
  CANCELADO: 'red',
  FACTURADO: 'blue',
}

const lineColumns = [
  {
    title: 'Artículo',
    dataIndex: 'nombreArticulo',
    key: 'nombreArticulo',
    ellipsis: true,
    render: (v: string) => v?.trim(),
  },
  {
    title: 'Cant.',
    dataIndex: 'cantidad',
    key: 'cantidad',
    width: 70,
    align: 'right' as const,
  },
  {
    title: 'Precio unit.',
    dataIndex: 'precioUnitario',
    key: 'precioUnitario',
    width: 100,
    align: 'right' as const,
    render: (v: number) => formatCurrency(v),
  },
  {
    title: 'Dto.',
    dataIndex: 'descuento',
    key: 'descuento',
    width: 70,
    align: 'right' as const,
    render: (v: number) => (v ? `${v}%` : '—'),
  },
  {
    title: 'Subtotal',
    dataIndex: 'subtotal',
    key: 'subtotal',
    width: 100,
    align: 'right' as const,
    render: (v: number) => formatCurrency(v),
  },
  {
    title: 'Total línea',
    dataIndex: 'totalLinea',
    key: 'totalLinea',
    width: 100,
    align: 'right' as const,
    render: (v: number) => formatCurrency(v),
  },
]

interface OrderDetailModalProps {
  orderId: number | null
  open: boolean
  onClose: () => void
  onFacturado?: () => void
}

export function OrderDetailModal({ orderId, open, onClose, onFacturado }: OrderDetailModalProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facturando, setFacturando] = useState(false)

  const clientIds = order ? [order.clienteId] : []
  const userIds = order ? [order.creadoPorId] : []
  const getClientName = useNameResolver(
    'clients',
    clientIds,
    (id) => clientsService.getById(String(id)).then((c) => c.nombre?.trim() ?? `#${id}`)
  )
  const getUserName = useNameResolver(
    'users',
    userIds,
    (id) => usersService.getById(String(id)).then((u) => u.nombre?.trim() ?? `#${id}`)
  )

  useEffect(() => {
    if (!open || !orderId) { setOrder(null); return }
    setLoading(true)
    setError(null)
    ordersService
      .getById(String(orderId))
      .then((data) => { setOrder(data); setLoading(false) })
      .catch((err) => { setError(getErrorMessage(err)); setLoading(false) })
  }, [open, orderId])

  const handleFacturar = async () => {
    if (!order) return
    setFacturando(true)
    try {
      const factura = await invoicesService.desdePedido(String(order.id))
      message.success(`Factura nº ${factura.numeroFactura} generada correctamente`)
      onFacturado?.()
      onClose()
    } catch (err) {
      message.error(getErrorMessage(err))
    } finally {
      setFacturando(false)
    }
  }

  const canFacturar = order?.facturable && order.estado !== 'FACTURADO'

  return (
    <Modal
      title={order ? `Pedido nº ${order.numero}` : 'Detalle de pedido'}
      open={open}
      onCancel={onClose}
      width={800}
      footer={
        canFacturar ? (
          <Popconfirm
            title="¿Generar factura para este pedido?"
            description="Se creará una factura vinculada a este pedido."
            onConfirm={handleFacturar}
            okText="Generar"
            cancelText="Cancelar"
          >
            <Button type="primary" icon={<FileTextOutlined />} loading={facturando}>
              Generar factura
            </Button>
          </Popconfirm>
        ) : (
          <Button onClick={onClose}>Cerrar</Button>
        )
      }
    >
      {loading && <Spin style={{ display: 'block', textAlign: 'center', padding: 32 }} />}
      {error && <Alert type="error" message={error} />}
      {order && !loading && (
        <>
          <Descriptions column={2} size="small" bordered style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Nº Pedido">{order.numero}</Descriptions.Item>
            <Descriptions.Item label="Fecha">{formatDate(order.fecha)}</Descriptions.Item>
            <Descriptions.Item label="Cliente">{getClientName(order.clienteId)}</Descriptions.Item>
            <Descriptions.Item label="Vendedor">{getUserName(order.creadoPorId)}</Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={ESTADO_COLORS[order.estado] ?? 'default'}>{order.estado}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Cobro">
              {order.estadoCobro ?? '—'}
            </Descriptions.Item>
            {order.observaciones && (
              <Descriptions.Item label="Observaciones" span={2}>
                {order.observaciones}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Total bruto">{formatCurrency(order.totalBruto)}</Descriptions.Item>
            <Descriptions.Item label="Descuento">{formatCurrency(order.totalDescuento)}</Descriptions.Item>
            <Descriptions.Item label="Total final">
              <strong>{formatCurrency(order.totalFinal)}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Importe cobrado">{formatCurrency(order.importeCobrado)}</Descriptions.Item>
            <Descriptions.Item label="Pendiente" span={2}>
              <span style={{ color: order.importePendiente > 0 ? '#ff4d4f' : undefined }}>
                {formatCurrency(order.importePendiente)}
              </span>
            </Descriptions.Item>
          </Descriptions>

          {order.lineas && order.lineas.length > 0 && (
            <Table<OrderLine>
              rowKey={(_, idx) => idx ?? 0}
              size="small"
              columns={lineColumns}
              dataSource={order.lineas}
              pagination={false}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} align="right">
                    <strong>Total final</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong>{formatCurrency(order.totalFinal)}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          )}
        </>
      )}
    </Modal>
  )
}
