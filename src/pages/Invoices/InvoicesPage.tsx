import { useState } from 'react'
import { Button, Card, Input, Select, Space, Table, Tag, Tooltip } from 'antd'
import { SearchOutlined, ReloadOutlined, ThunderboltOutlined, EyeOutlined, FilePdfOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Invoice } from '@/types'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useInvoices } from '@/hooks/useInvoices'
import { formatCurrency, formatDate } from '@/lib/format'
import { BulkInvoiceModal } from './BulkInvoiceModal'
import { InvoiceDetailModal } from './InvoiceDetailModal'

const ESTADO_COLORS: Record<string, string> = {
  EMITIDA: 'blue',
  PAGADA: 'green',
  VENCIDA: 'red',
  ANULADA: 'default',
}

export function InvoicesPage() {
  const { invoices, total, loading, error, page, pageSize, setPage, setFilters, refresh } =
    useInvoices()
  const [bulkOpen, setBulkOpen] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null)
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
    {
      title: 'Nº Factura',
      dataIndex: 'numeroFactura',
      key: 'numeroFactura',
      width: 100,
    },
    {
      title: 'Fecha emisión',
      dataIndex: 'fechaEmision',
      key: 'fechaEmision',
      width: 120,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Cliente',
      dataIndex: 'nombreCliente',
      key: 'nombreCliente',
      ellipsis: true,
      render: (v: string) => v?.trim() || '—',
    },
    {
      title: 'Doc. fiscal',
      dataIndex: 'documentoFiscalCliente',
      key: 'documentoFiscalCliente',
      width: 130,
      render: (v?: string) => v?.trim() || '—',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 90,
      render: (estado: string) => (
        <Tag color={ESTADO_COLORS[estado] ?? 'default'}>{estado}</Tag>
      ),
    },
    {
      title: 'Base imp.',
      dataIndex: 'baseImponible',
      key: 'baseImponible',
      width: 100,
      align: 'right',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'IVA',
      dataIndex: 'impuestos',
      key: 'impuestos',
      width: 90,
      align: 'right',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 100,
      align: 'right',
      render: (v: number) => <strong>{formatCurrency(v)}</strong>,
    },
    {
      title: 'Pedido',
      dataIndex: 'pedidoId',
      key: 'pedidoId',
      width: 70,
      render: (v: number) => `#${v}`,
    },
    {
      title: 'PDF',
      dataIndex: 'pdfFileName',
      key: 'pdfFileName',
      width: 60,
      align: 'center',
      render: (v?: string) =>
        v ? (
          <Tooltip title="Descarga no disponible — requiere endpoint GET /admin/facturas/{id}/pdf en backend">
            <Button
              type="text"
              size="small"
              icon={<FilePdfOutlined style={{ color: '#bfbfbf' }} />}
              disabled
            />
          </Tooltip>
        ) : '—',
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 70,
      render: (_, invoice) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setSelectedInvoiceId(invoice.id)}
        >
          Ver
        </Button>
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
          <Button icon={<ThunderboltOutlined />} onClick={() => setBulkOpen(true)}>
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
              { label: 'Emitida', value: 'EMITIDA' },
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
          scroll={{ x: 'max-content' }}
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

      <InvoiceDetailModal
        invoiceId={selectedInvoiceId}
        open={!!selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
      />

      <BulkInvoiceModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onDone={refresh}
      />
    </div>
  )
}
