import { useState } from 'react'
import {
  Drawer, Tabs, Descriptions, Table, Button, Space, Tag, Alert,
  DatePicker, Tooltip, message,
} from 'antd'
import { FilePdfOutlined, EyeOutlined } from '@ant-design/icons'
import { invoicesService } from '@/services/api/invoices'
import { getErrorMessage } from '@/lib/apiError'
import type { ColumnsType } from 'antd/es/table'
import type { Client, Invoice } from '@/types'
import { StatusTag } from '@/components/common/StatusTag'
import { InvoiceDetailModal } from '@/pages/Invoices/InvoiceDetailModal'
import { useClientInvoices } from '@/hooks/useClientInvoices'
import { formatCurrency, formatDate } from '@/lib/format'

const { RangePicker } = DatePicker

const ESTADO_COLORS: Record<string, string> = {
  EMITIDA: 'blue',
  PAGADA: 'green',
  VENCIDA: 'red',
  ANULADA: 'default',
}

interface ClientDetailDrawerProps {
  client: Client | null
  open: boolean
  onClose: () => void
}

function ClientDataTab({ client }: { client: Client }) {
  const t = (v?: string | null) => v?.trim() || '—'
  return (
    <Descriptions column={2} size="small" bordered>
      <Descriptions.Item label="Nombre">{t(client.nombre)}</Descriptions.Item>
      <Descriptions.Item label="Nombre comercial">{t(client.nombreComercio)}</Descriptions.Item>
      <Descriptions.Item label="Doc. fiscal">{t(client.documentoFiscal)}</Descriptions.Item>
      <Descriptions.Item label="Teléfono">{t(client.telefono)}</Descriptions.Item>
      <Descriptions.Item label="Dirección">{t(client.direccion)}</Descriptions.Item>
      <Descriptions.Item label="Población">{t(client.poblacion)}</Descriptions.Item>
      <Descriptions.Item label="Estado">
        <StatusTag activo={client.activo} />
      </Descriptions.Item>
    </Descriptions>
  )
}

function ClientInvoicesTab({ clienteId }: { clienteId: number }) {
  const { invoices, loading, error, setDateRange } = useClientInvoices(clienteId)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const handleDownloadPdf = async (id: number) => {
    setDownloadingId(id)
    try {
      await invoicesService.downloadPdf(id)
    } catch (err) {
      message.error(getErrorMessage(err, 'No se pudo descargar el PDF'))
    } finally {
      setDownloadingId(null)
    }
  }

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Nº',
      dataIndex: 'numeroFactura',
      key: 'numeroFactura',
      width: 60,
    },
    {
      title: 'Fecha emisión',
      dataIndex: 'fechaEmision',
      key: 'fechaEmision',
      width: 120,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 90,
      render: (v: string) => <Tag color={ESTADO_COLORS[v] ?? 'default'}>{v}</Tag>,
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
      title: '',
      key: 'actions',
      width: 80,
      render: (_, invoice) => (
        <Space size={4}>
          <Tooltip title="Ver detalle">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelectedInvoiceId(invoice.id)}
            />
          </Tooltip>
          {invoice.pdfFileName && (
            <Tooltip title="Descargar PDF">
              <Button
                size="small"
                icon={<FilePdfOutlined />}
                loading={downloadingId === invoice.id}
                onClick={() => handleDownloadPdf(invoice.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          format="DD/MM/YYYY"
          onChange={(dates) => {
            // Use Dayjs objects to get YYYY-MM-DD for ISO comparison in the hook
            setDateRange({
              desde: dates?.[0]?.format('YYYY-MM-DD') ?? undefined,
              hasta: dates?.[1]?.format('YYYY-MM-DD') ?? undefined,
            })
          }}
          allowClear
          placeholder={['Desde', 'Hasta']}
        />
      </Space>

      {error && <Alert type="error" message={error} style={{ marginBottom: 12 }} />}

      <Table<Invoice>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={invoices}
        loading={loading}
        pagination={false}
        locale={{ emptyText: 'Sin facturas para este cliente en el período seleccionado' }}
        summary={
          invoices.length > 0
            ? () => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} />
                  <Table.Summary.Cell index={1} align="right">
                    <strong>{formatCurrency(invoices.reduce((s, i) => s + i.baseImponible, 0))}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <strong>{formatCurrency(invoices.reduce((s, i) => s + i.impuestos, 0))}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <strong>{formatCurrency(invoices.reduce((s, i) => s + i.total, 0))}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} />
                </Table.Summary.Row>
              )
            : undefined
        }
      />

      <InvoiceDetailModal
        invoiceId={selectedInvoiceId}
        open={!!selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
      />
    </>
  )
}

export function ClientDetailDrawer({ client, open, onClose }: ClientDetailDrawerProps) {
  const clienteId = client?.id ? Number(client.id) : null

  return (
    <Drawer
      title={client?.nombre?.trim() ?? 'Detalle del cliente'}
      open={open}
      onClose={onClose}
      width={900}
      destroyOnClose
    >
      {client && (
        <Tabs
          defaultActiveKey="datos"
          items={[
            {
              key: 'datos',
              label: 'Datos del cliente',
              children: <ClientDataTab client={client} />,
            },
            {
              key: 'facturas',
              label: 'Facturas',
              children: clienteId ? <ClientInvoicesTab clienteId={clienteId} /> : null,
            },
          ]}
        />
      )}
    </Drawer>
  )
}
