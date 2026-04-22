import { useState } from 'react'
import { Button, Card, Input, Select, Space, Table, Tag } from 'antd'
import { SearchOutlined, ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Invoice } from '@/types'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useInvoices } from '@/hooks/useInvoices'
import { formatCurrency, formatDate } from '@/lib/format'
import { BulkInvoiceModal } from './BulkInvoiceModal'

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'orange',
  PAGADA: 'green',
  VENCIDA: 'red',
  ANULADA: 'default',
}

export function InvoicesPage() {
  const { invoices, total, loading, error, page, pageSize, setPage, setFilters, refresh } =
    useInvoices()
  const [bulkOpen, setBulkOpen] = useState(false)
  const [nombreInput, setNombreInput] = useState('')
  const [estadoInput, setEstadoInput] = useState<string | undefined>(undefined)

  const handleSearch = () =>
    setFilters({ clienteNombre: nombreInput || undefined, estado: estadoInput })

  const handleClear = () => {
    setNombreInput('')
    setEstadoInput(undefined)
    setFilters({})
  }

  const columns: ColumnsType<Invoice> = [
    { title: 'Nº Factura', dataIndex: 'numeroFactura', key: 'numeroFactura' },
    { title: 'Cliente', dataIndex: 'clienteNombre', key: 'clienteNombre' },
    {
      title: 'Nº Pedido',
      dataIndex: 'numeroPedido',
      key: 'numeroPedido',
      render: (v) => v ?? '—',
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Importe',
      dataIndex: 'importeTotal',
      key: 'importeTotal',
      align: 'right',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => (
        <Tag color={ESTADO_COLORS[estado] ?? 'default'}>{estado}</Tag>
      ),
    },
  ]

  if (error && !loading) return <ErrorState message={error} onRetry={refresh} />

  return (
    <div>
      <PageHeader
        title="Facturas"
        subtitle="Visualización y gestión de facturas"
        actions={
          <Button
            icon={<ThunderboltOutlined />}
            onClick={() => setBulkOpen(true)}
          >
            Facturación masiva
          </Button>
        }
      />

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
              { label: 'Pagada', value: 'PAGADA' },
              { label: 'Vencida', value: 'VENCIDA' },
              { label: 'Anulada', value: 'ANULADA' },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>Buscar</Button>
          <Button icon={<ReloadOutlined />} onClick={handleClear}>Limpiar</Button>
        </Space>
      </Card>

      <Card>
        <Table<Invoice>
          rowKey="id"
          columns={columns}
          dataSource={invoices}
          loading={loading}
          locale={{ emptyText: <EmptyState description="No hay facturas registradas" /> }}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: setPage,
            showSizeChanger: false,
            showTotal: (t) => `${t} facturas`,
          }}
        />
      </Card>

      <BulkInvoiceModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onDone={refresh}
      />
    </div>
  )
}
