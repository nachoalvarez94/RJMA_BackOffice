import { useEffect, useMemo, useState } from 'react'
import {
  Modal, Form, Input, InputNumber, Select, Button,
  Table, Space, Alert, Spin, Divider, Typography,
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { Client, Product, OrderUpdateLine } from '@/types'
import { ordersService } from '@/services/api/orders'
import { clientsService } from '@/services/api/clients'
import { productsService } from '@/services/api/products'
import { getErrorMessage } from '@/lib/apiError'
import { formatCurrency } from '@/lib/format'

const { Text } = Typography

interface LineState {
  key: string
  articuloId: number | null
  nombre: string
  precioUnitario: number
  cantidad: number
  descuento: number
}

interface OrderEditModalProps {
  orderId: number | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

let keyCounter = 0
const nextKey = () => String(++keyCounter)

export function OrderEditModal({ orderId, open, onClose, onSaved }: OrderEditModalProps) {
  const [form] = Form.useForm()
  const [orderNumero, setOrderNumero] = useState<number | null>(null)
  const [lines, setLines] = useState<LineState[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !orderId) {
      setOrderNumero(null)
      setLines([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    Promise.all([
      ordersService.getById(String(orderId)),
      clientsService.getAll({ pageSize: 500 }),
      productsService.getAll({ pageSize: 500, activo: true }),
    ])
      .then(([orderData, clientsData, productsData]) => {
        setOrderNumero(orderData.numero)
        setClients(clientsData.data)
        setProducts(productsData.data)

        form.setFieldsValue({
          clienteId: orderData.clienteId,
          observaciones: orderData.observaciones ?? '',
          importeCobrado: orderData.importeCobrado,
        })

        setLines(
          (orderData.lineas ?? []).map((l) => ({
            key: nextKey(),
            articuloId: l.articuloId ?? null,
            nombre: l.nombreArticulo,
            precioUnitario: l.precioUnitario,
            cantidad: l.cantidad,
            descuento: l.descuento,
          }))
        )
        setLoading(false)
      })
      .catch((err) => {
        setError(getErrorMessage(err))
        setLoading(false)
      })
  }, [open, orderId, form])

  const totals = useMemo(() => {
    let totalBruto = 0
    let totalDescuento = 0
    let totalFinal = 0
    for (const l of lines) {
      const subtotal = l.precioUnitario * l.cantidad
      const totalLinea = subtotal - l.descuento
      totalBruto += subtotal
      totalDescuento += l.descuento
      totalFinal += totalLinea
    }
    return { totalBruto, totalDescuento, totalFinal }
  }, [lines])

  const handleProductSelect = (key: string, articuloId: number) => {
    const product = products.find((p) => Number(p.id) === articuloId)
    if (!product) return
    setLines((prev) =>
      prev.map((l) =>
        l.key === key
          ? { ...l, articuloId, nombre: product.nombre, precioUnitario: product.precio }
          : l
      )
    )
  }

  const handleLineChange = (key: string, field: 'cantidad' | 'descuento', value: number) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, [field]: value } : l)))
  }

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      { key: nextKey(), articuloId: null, nombre: '', precioUnitario: 0, cantidad: 1, descuento: 0 },
    ])
  }

  const handleRemoveLine = (key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key))
  }

  const handleSave = async () => {
    if (!orderId) return

    let values: { clienteId: number; observaciones: string; importeCobrado: number }
    try {
      values = await form.validateFields()
    } catch {
      return
    }

    if (lines.length === 0) {
      setError('El pedido debe tener al menos una línea')
      return
    }

    const invalidLine = lines.find((l) => !l.articuloId || l.cantidad <= 0)
    if (invalidLine) {
      setError('Todas las líneas deben tener un artículo y cantidad mayor que 0')
      return
    }

    setSaving(true)
    setError(null)

    const lineasPayload: OrderUpdateLine[] = lines.map((l) => ({
      articuloId: l.articuloId!,
      cantidad: l.cantidad,
      ...(l.descuento > 0 && { descuento: l.descuento }),
    }))

    try {
      await ordersService.update(orderId, {
        clienteId: values.clienteId,
        observaciones: values.observaciones || undefined,
        importeCobrado: values.importeCobrado,
        lineas: lineasPayload,
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      title: 'Artículo',
      key: 'articulo',
      render: (_: unknown, record: LineState) => (
        <Select
          showSearch
          value={record.articuloId ?? undefined}
          placeholder="Buscar artículo…"
          style={{ width: 280 }}
          filterOption={(input, option) =>
            String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={products.map((p) => ({
            value: Number(p.id),
            label: p.nombre + (p.codigoInterno ? ` [${p.codigoInterno}]` : ''),
          }))}
          onChange={(val) => handleProductSelect(record.key, val)}
        />
      ),
    },
    {
      title: 'Precio',
      key: 'precio',
      width: 90,
      align: 'right' as const,
      render: (_: unknown, record: LineState) => formatCurrency(record.precioUnitario),
    },
    {
      title: 'Cant.',
      key: 'cantidad',
      width: 110,
      align: 'right' as const,
      render: (_: unknown, record: LineState) => (
        <InputNumber
          min={0.0001}
          step={1}
          value={record.cantidad}
          style={{ width: '100%' }}
          onChange={(v) => handleLineChange(record.key, 'cantidad', v ?? 0)}
        />
      ),
    },
    {
      title: 'Descuento (€)',
      key: 'descuento',
      width: 120,
      align: 'right' as const,
      render: (_: unknown, record: LineState) => (
        <InputNumber
          min={0}
          step={0.01}
          precision={2}
          value={record.descuento}
          style={{ width: '100%' }}
          onChange={(v) => handleLineChange(record.key, 'descuento', v ?? 0)}
        />
      ),
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      width: 100,
      align: 'right' as const,
      render: (_: unknown, record: LineState) =>
        formatCurrency(record.precioUnitario * record.cantidad),
    },
    {
      title: 'Total línea',
      key: 'total',
      width: 100,
      align: 'right' as const,
      render: (_: unknown, record: LineState) =>
        formatCurrency(record.precioUnitario * record.cantidad - record.descuento),
    },
    {
      title: '',
      key: 'delete',
      width: 48,
      render: (_: unknown, record: LineState) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          size="small"
          onClick={() => handleRemoveLine(record.key)}
        />
      ),
    },
  ]

  return (
    <Modal
      title={orderNumero != null ? `Editar pedido nº ${orderNumero}` : 'Editar pedido'}
      open={open}
      onCancel={onClose}
      width={1000}
      footer={
        <Space>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="primary" loading={saving} onClick={handleSave}>
            Guardar cambios
          </Button>
        </Space>
      }
      destroyOnClose
    >
      {loading && <Spin style={{ display: 'block', textAlign: 'center', padding: 32 }} />}
      {error && (
        <Alert
          type="error"
          message={error}
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setError(null)}
        />
      )}

      {!loading && orderNumero != null && (
        <>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Cliente"
              name="clienteId"
              rules={[{ required: true, message: 'Selecciona un cliente' }]}
            >
              <Select
                showSearch
                placeholder="Seleccionar cliente"
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={clients.map((c) => ({
                  value: Number(c.id),
                  label: c.nombre?.trim() + (c.documentoFiscal ? ` — ${c.documentoFiscal}` : ''),
                }))}
              />
            </Form.Item>

            <Form.Item label="Observaciones" name="observaciones">
              <Input.TextArea rows={2} allowClear />
            </Form.Item>

            <Form.Item label="Importe cobrado (€)" name="importeCobrado">
              <InputNumber min={0} step={0.01} precision={2} style={{ width: 200 }} />
            </Form.Item>
          </Form>

          <Divider orientation="left" plain>
            Líneas del pedido
          </Divider>

          <Table
            dataSource={lines}
            columns={columns}
            rowKey="key"
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
            footer={() => (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddLine}
                style={{ width: '100%' }}
              >
                Añadir línea
              </Button>
            )}
          />

          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Space direction="vertical" align="end" size={4}>
              <Text>
                Total bruto: <strong>{formatCurrency(totals.totalBruto)}</strong>
              </Text>
              {totals.totalDescuento > 0 && (
                <Text type="secondary">
                  Descuento total: −{formatCurrency(totals.totalDescuento)}
                </Text>
              )}
              <Text style={{ fontSize: 16 }}>
                Total: <strong>{formatCurrency(totals.totalFinal)}</strong>
              </Text>
            </Space>
          </div>
        </>
      )}
    </Modal>
  )
}
