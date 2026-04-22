import { useState, useCallback } from 'react'
import { Button, Card, Input, Select, Space, Table, Tag, Tabs, Popconfirm, message } from 'antd'
import { SearchOutlined, ReloadOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Order } from '@/types'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useOrders, usePendientesFacturacion } from '@/hooks/useOrders'
import { invoicesService } from '@/services/api/invoices'
import { getErrorMessage } from '@/lib/apiError'
import { formatCurrency, formatDate } from '@/lib/format'
import { OrderDetailModal } from './OrderDetailModal'

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'orange',
  COMPLETADO: 'green',
  CANCELADO: 'red',
  FACTURADO: 'blue',
}

function EstadoTag({ estado }: { estado: string }) {
  return <Tag color={ESTADO_COLORS[estado] ?? 'default'}>{estado}</Tag>
}

function TodosTab() {
  const { orders, total, loading, error, page, pageSize, setPage, setFilters, refresh } =
    useOrders()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [nombreInput, setNombreInput] = useState('')
  const [estadoInput, setEstadoInput] = useState<string | undefined>(undefined)

  const handleSearch = () =>
    setFilters({ clienteNombre: nombreInput || undefined, estado: estadoInput })

  const handleClear = () => {
    setNombreInput('')
    setEstadoInput(undefined)
    setFilters({})
  }

  const columns: ColumnsType<Order> = [
    { title: 'Nº Pedido', dataIndex: 'numeroPedido', key: 'numeroPedido' },
    { title: 'Cliente', dataIndex: 'clienteNombre', key: 'clienteNombre' },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: (v: string) => formatDate(v) },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => <EstadoTag estado={estado} />,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      render: (_, order) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setSelectedOrderId(order.id)}
        >
          Ver
        </Button>
      ),
    },
  ]

  if (error && !loading) return <ErrorState message={error} onRetry={refresh} />

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Buscar por cliente"
            value={nombreInput}
            onChange={(e) => setNombreInput(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Select
            placeholder="Estado"
            value={estadoInput}
            onChange={setEstadoInput}
            allowClear
            style={{ width: 160 }}
            options={[
              { label: 'Pendiente', value: 'PENDIENTE' },
              { label: 'Completado', value: 'COMPLETADO' },
              { label: 'Facturado', value: 'FACTURADO' },
              { label: 'Cancelado', value: 'CANCELADO' },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>Buscar</Button>
          <Button icon={<ReloadOutlined />} onClick={handleClear}>Limpiar</Button>
        </Space>
      </Card>
      <Card>
        <Table<Order>
          rowKey="id"
          columns={columns}
          dataSource={orders}
          loading={loading}
          locale={{ emptyText: <EmptyState description="No hay pedidos registrados" /> }}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: setPage,
            showSizeChanger: false,
            showTotal: (t) => `${t} pedidos`,
          }}
        />
      </Card>
      <OrderDetailModal
        orderId={selectedOrderId}
        open={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onFacturado={refresh}
      />
    </>
  )
}

function PendientesTab() {
  const { orders, loading, error, refresh } = usePendientesFacturacion()
  const [facturando, setFacturando] = useState<string | null>(null)

  const handleFacturar = useCallback(
    async (order: Order) => {
      setFacturando(order.id)
      try {
        const factura = await invoicesService.desdePedido(order.id)
        message.success(`Factura ${factura.numeroFactura} generada correctamente`)
        refresh()
      } catch (err) {
        message.error(getErrorMessage(err))
      } finally {
        setFacturando(null)
      }
    },
    [refresh]
  )

  const columns: ColumnsType<Order> = [
    { title: 'Nº Pedido', dataIndex: 'numeroPedido', key: 'numeroPedido' },
    { title: 'Cliente', dataIndex: 'clienteNombre', key: 'clienteNombre' },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: (v: string) => formatDate(v) },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 140,
      render: (_, order) => (
        <Popconfirm
          title="¿Generar factura para este pedido?"
          onConfirm={() => handleFacturar(order)}
          okText="Generar"
          cancelText="Cancelar"
        >
          <Button
            size="small"
            type="primary"
            icon={<FileTextOutlined />}
            loading={facturando === order.id}
          >
            Facturar
          </Button>
        </Popconfirm>
      ),
    },
  ]

  if (error && !loading) return <ErrorState message={error} onRetry={refresh} />

  return (
    <Card>
      <Table<Order>
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        locale={{ emptyText: <EmptyState description="No hay pedidos pendientes de facturación" /> }}
        pagination={false}
      />
    </Card>
  )
}

export function OrdersPage() {
  return (
    <div>
      <PageHeader title="Pedidos" subtitle="Visualización global de pedidos" />
      <Tabs
        defaultActiveKey="todos"
        items={[
          { key: 'todos', label: 'Todos los pedidos', children: <TodosTab /> },
          { key: 'pendientes', label: 'Pendientes de facturación', children: <PendientesTab /> },
        ]}
      />
    </div>
  )
}
