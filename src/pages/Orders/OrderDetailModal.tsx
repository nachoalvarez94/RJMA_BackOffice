import { useEffect, useState } from 'react'
import { Modal, Descriptions, Table, Tag, Button, Popconfirm, message, Spin, Alert } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import type { Order, OrderLine } from '@/types'
import { ordersService } from '@/services/api/orders'
import { invoicesService } from '@/services/api/invoices'
import { getErrorMessage } from '@/lib/apiError'
import { formatCurrency, formatDate } from '@/lib/format'

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'orange',
  COMPLETADO: 'green',
  CANCELADO: 'red',
  FACTURADO: 'blue',
}

const lineColumns = [
  { title: 'Producto', dataIndex: 'productoNombre', key: 'productoNombre' },
  { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad', align: 'right' as const },
  {
    title: 'Precio unit.',
    dataIndex: 'precioUnitario',
    key: 'precioUnitario',
    align: 'right' as const,
    render: (v: number) => formatCurrency(v),
  },
  {
    title: 'Subtotal',
    dataIndex: 'subtotal',
    key: 'subtotal',
    align: 'right' as const,
    render: (v: number) => formatCurrency(v),
  },
]

interface OrderDetailModalProps {
  orderId: string | null
  open: boolean
  onClose: () => void
  onFacturado?: () => void
}

export function OrderDetailModal({ orderId, open, onClose, onFacturado }: OrderDetailModalProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facturando, setFacturando] = useState(false)

  useEffect(() => {
    if (!open || !orderId) return
    setLoading(true)
    setError(null)
    ordersService
      .getById(orderId)
      .then((data) => { setOrder(data); setLoading(false) })
      .catch((err) => { setError(getErrorMessage(err)); setLoading(false) })
  }, [open, orderId])

  const handleFacturar = async () => {
    if (!order) return
    setFacturando(true)
    try {
      const factura = await invoicesService.desdePedido(order.id)
      message.success(`Factura ${factura.numeroFactura} generada correctamente`)
      onFacturado?.()
      onClose()
    } catch (err) {
      message.error(getErrorMessage(err))
    } finally {
      setFacturando(false)
    }
  }

  const canFacturar = order && order.pendienteFacturacion && order.estado !== 'FACTURADO'

  return (
    <Modal
      title={order ? `Pedido ${order.numeroPedido}` : 'Detalle de pedido'}
      open={open}
      onCancel={onClose}
      width={720}
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
            <Descriptions.Item label="Nº Pedido">{order.numeroPedido}</Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={ESTADO_COLORS[order.estado] ?? 'default'}>{order.estado}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Cliente">{order.clienteNombre}</Descriptions.Item>
            <Descriptions.Item label="Fecha">{formatDate(order.fecha)}</Descriptions.Item>
            <Descriptions.Item label="Total" span={2}>
              <strong>{formatCurrency(order.total)}</strong>
            </Descriptions.Item>
          </Descriptions>

          {order.lineas && order.lineas.length > 0 && (
            <Table<OrderLine>
              rowKey="id"
              size="small"
              columns={lineColumns}
              dataSource={order.lineas}
              pagination={false}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} align="right">
                    <strong>Total</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong>{formatCurrency(order.total)}</strong>
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
