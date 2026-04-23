import { useEffect, useState } from 'react'
import { Modal, Descriptions, Table, Tag, Button, Spin, Alert, Typography, Space, message } from 'antd'
import { FilePdfOutlined, DownloadOutlined } from '@ant-design/icons'
import type { Invoice, InvoiceLine } from '@/types'
import { invoicesService } from '@/services/api/invoices'
import { useNameResolver } from '@/hooks/useNameResolver'
import { usersService } from '@/services/api/users'
import { getErrorMessage } from '@/lib/apiError'
import { formatCurrency, formatDate } from '@/lib/format'

const { Text } = Typography

const ESTADO_COLORS: Record<string, string> = {
  EMITIDA: 'blue',
  PAGADA: 'green',
  VENCIDA: 'red',
  ANULADA: 'default',
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
    title: 'Cód.',
    dataIndex: 'codigoArticulo',
    key: 'codigoArticulo',
    width: 90,
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
    title: 'Subtotal',
    dataIndex: 'subtotal',
    key: 'subtotal',
    width: 100,
    align: 'right' as const,
    render: (v: number) => formatCurrency(v),
  },
  {
    title: 'IVA %',
    dataIndex: 'tipoIva',
    key: 'tipoIva',
    width: 70,
    align: 'right' as const,
    render: (v: number) => `${v}%`,
  },
  {
    title: 'Cuota IVA',
    dataIndex: 'cuotaIva',
    key: 'cuotaIva',
    width: 90,
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

interface InvoiceDetailModalProps {
  invoiceId: number | null
  open: boolean
  onClose: () => void
}

export function InvoiceDetailModal({ invoiceId, open, onClose }: InvoiceDetailModalProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!invoice) return
    setDownloading(true)
    try {
      await invoicesService.downloadPdf(invoice.id, invoice.pdfFileName)
    } catch (err) {
      message.error(getErrorMessage(err))
    } finally {
      setDownloading(false)
    }
  }

  const userIds = invoice ? [invoice.emitidaPorId] : []
  const getUserName = useNameResolver(
    'users',
    userIds,
    (id) => usersService.getById(String(id)).then((u) => u.nombre?.trim() ?? `#${id}`)
  )

  useEffect(() => {
    if (!open || !invoiceId) { setInvoice(null); return }
    setLoading(true)
    setError(null)
    invoicesService
      .getById(String(invoiceId))
      .then((data) => { setInvoice(data); setLoading(false) })
      .catch((err) => { setError(getErrorMessage(err)); setLoading(false) })
  }, [open, invoiceId])

  return (
    <Modal
      title={invoice ? `Factura nº ${invoice.numeroFactura}` : 'Detalle de factura'}
      open={open}
      onCancel={onClose}
      footer={
        <Space>
          {invoice?.pdfFileName && (
            <Button
              icon={<DownloadOutlined />}
              loading={downloading}
              onClick={handleDownload}
            >
              Descargar PDF
            </Button>
          )}
          <Button onClick={onClose}>Cerrar</Button>
        </Space>
      }
      width={900}
    >
      {loading && <Spin style={{ display: 'block', textAlign: 'center', padding: 32 }} />}
      {error && <Alert type="error" message={error} />}
      {invoice && !loading && (
        <>
          <Descriptions column={2} size="small" bordered style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Nº Factura">{invoice.numeroFactura}</Descriptions.Item>
            <Descriptions.Item label="Fecha emisión">{formatDate(invoice.fechaEmision)}</Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag color={ESTADO_COLORS[invoice.estado] ?? 'default'}>{invoice.estado}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Nº Pedido">#{invoice.pedidoId}</Descriptions.Item>
            <Descriptions.Item label="Cliente">{invoice.nombreCliente?.trim()}</Descriptions.Item>
            <Descriptions.Item label="Doc. fiscal">{invoice.documentoFiscalCliente?.trim() || '—'}</Descriptions.Item>
            <Descriptions.Item label="Email">{invoice.emailCliente || '—'}</Descriptions.Item>
            <Descriptions.Item label="Teléfono">{invoice.telefonoCliente || '—'}</Descriptions.Item>
            {invoice.direccionCliente && (
              <Descriptions.Item label="Dirección" span={2}>
                {invoice.direccionCliente.trim()}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Emitida por">{getUserName(invoice.emitidaPorId)}</Descriptions.Item>
            <Descriptions.Item label="Base imponible">{formatCurrency(invoice.baseImponible)}</Descriptions.Item>
            <Descriptions.Item label="IVA">{formatCurrency(invoice.impuestos)}</Descriptions.Item>
            <Descriptions.Item label="Total">
              <strong>{formatCurrency(invoice.total)}</strong>
            </Descriptions.Item>
            {invoice.pdfFileName && (
              <Descriptions.Item label="PDF" span={2}>
                <FilePdfOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
                <Text code>{invoice.pdfFileName}</Text>
                {invoice.pdfVersion && (
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    v{invoice.pdfVersion}
                  </Text>
                )}
              </Descriptions.Item>
            )}
          </Descriptions>

          {invoice.lineas && invoice.lineas.length > 0 && (
            <Table<InvoiceLine>
              rowKey="id"
              size="small"
              columns={lineColumns}
              dataSource={invoice.lineas}
              pagination={false}
              scroll={{ x: 'max-content' }}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={7} align="right">
                    <strong>Total</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong>{formatCurrency(invoice.total)}</strong>
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
