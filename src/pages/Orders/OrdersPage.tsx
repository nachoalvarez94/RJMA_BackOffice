import { useState, useCallback } from 'react'
import { Button, Card, Input, Select, Space, Table, Tag, Tabs, Popconfirm, message, Tooltip } from 'antd'
import { SearchOutlined, ReloadOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Order } from '@/types'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useOrders, usePendientesFacturacion } from '@/hooks/useOrders'
import { useNameResolver } from '@/hooks/useNameResolver'
import { clientsService } from '@/services/api/clients'
import { usersService } from '@/services/api/users'
import { invoicesService } from '@/services/api/invoices'
import { getErrorMessage } from '@/lib/apiError'
import { formatCurrency, formatDate } from '@/lib/format'
import { OrderDetailModal } from './OrderDetailModal'

const ESTADO_COLORS: Record<string, string> = {
  BORRADOR: 'default',
  PENDIENTE: 'orange',
  COMPLETADO: 'green',
  CANCELADO: 'red',
  FACTURADO: 'blue',
}

const COBRO_COLORS: Record<string, string> = {
  PENDIENTE: 'orange',
  PARCIAL: 'processing',
  COMPLETO: 'success',
}

function EstadoTag({ estado }: { estado: string }) {
  return <Tag color={ESTADO_COLORS[estado] ?? 'default'}>{estado}</Tag>
}

function CobroTag({ estado }: { estado?: string }) {
  if (!estado) return <span>—</span>
  return <Tag color={COBRO_COLORS[estado] ?? 'default'}>{estado}</Tag>
}

function resolveClientName(id: number) {
  return clientsService.getById(String(id)).then((c) => c.nombre?.trim() ?? `#${id}`)
}

function resolveUserName(id: number) {
  return usersService.getById(String(id)).then((u) => u.nombre?.trim() ?? `#${id}`)
}

function TodosTab() {
  const { orders, total, loading, error, page, pageSize, setPage, setFilters, refresh } = useOrders()
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [nombreInput, setNombreInput] = useState('')
  const [estadoInput, setEstadoInput] = useState<string | undefined>(undefined)

  const clientIds = orders.map((o) => o.clienteId)
  const userIds = orders.map((o) => o.creadoPorId)
  const getClientName = useNameResolver('clients', clientIds, resolveClientName)
  const getUserName = useNameResolver('users', userIds, resolveUserName)

  const handleSearch = () => setFilters({ clienteNombre: nombreInput || undefined, estado: estadoInput })
  const handleClear = () => { setNombreInput(''); setEstadoInput(undefined); setFilters({}) }

  const columns: ColumnsType<Order> = [
    { title: 'Nº', dataIndex: 'numero', key: 'numero', width: 60 },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 100,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Cliente',
      key: 'cliente',
      ellipsis: true,
      render: (_, o) => getClientName(o.clienteId),
    },
    {
      title: 'Vendedor',
      key: 'vendedor',
      ellipsis: true,
      render: (_, o) => getUserName(o.creadoPorId),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 110,
      render: (v: string) => <EstadoTag estado={v} />,
    },
    {
      title: 'Cobro',
      dataIndex: 'estadoCobro',
      key: 'estadoCobro',
      width: 100,
      render: (v?: string) => <CobroTag estado={v} />,
    },
    {
      title: 'Total',
      dataIndex: 'totalFinal',
      key: 'totalFinal',
      width: 100,
      align: 'right',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Cobrado',
      dataIndex: 'importeCobrado',
      key: 'importeCobrado',
      width: 100,
      align: 'right',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Pendiente',
      dataIndex: 'importePendiente',
      key: 'importePendiente',
      width: 100,
      align: 'right',
      render: (v: number) => (
        <span style={{ color: v > 0 ? '#ff4d4f' : undefined }}>{formatCurrency(v)}</span>
      ),
    },
    {
      title: '',
      dataIndex: 'facturable',
      key: 'facturable',
      width: 80,
      render: (v: boolean) =>
        v ? <Tag color="geekblue">Facturable</Tag> : null,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 80,
      render: (_, order) => (
        <Tooltip title="Ver detalle">
          <Button size="small" icon={<EyeOutlined />} onClick={() => setSelectedOrderId(order.id)}>
            Ver
          </Button>
        </Tooltip>
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
              { label: 'Borrador', value: 'BORRADOR' },
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
          scroll={{ x: 'max-content' }}
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
  const [facturando, setFacturando] = useState<number | null>(null)

  const clientIds = orders.map((o) => o.clienteId)
  const getClientName = useNameResolver('clients', clientIds, resolveClientName)

  const handleFacturar = useCallback(
    async (order: Order) => {
      setFacturando(order.id)
      try {
        const factura = await invoicesService.desdePedido(String(order.id))
        message.success(`Factura nº ${factura.numeroFactura} generada correctamente`)
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
    { title: 'Nº', dataIndex: 'numero', key: 'numero', width: 60 },
    {
      title: 'Cliente',
      key: 'cliente',
      ellipsis: true,
      render: (_, o) => getClientName(o.clienteId),
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 100,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Total',
      dataIndex: 'totalFinal',
      key: 'totalFinal',
      width: 100,
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
