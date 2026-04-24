import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button, Card, Col, Row, Select, Statistic, Table, Tag, Tooltip, message, Spin, Alert,
} from 'antd'
import { ExportOutlined, EyeOutlined, FilePdfOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Invoice } from '@/types'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { invoicesService } from '@/services/api/invoices'
import { getErrorMessage } from '@/lib/apiError'
import { formatCurrency, formatDate } from '@/lib/format'
import { exportInvoicesToCsv } from '@/pages/Invoices/exportInvoices'
import { InvoiceDetailModal } from '@/pages/Invoices/InvoiceDetailModal'

// ── Types & constants ───────────────────────────────────────────────────────

type Quarter = 1 | 2 | 3 | 4

/** Fechas de inicio y fin (MM-DD) de cada trimestre */
const QUARTER_BOUNDS: Record<Quarter, [string, string]> = {
  1: ['01-01', '03-31'],
  2: ['04-01', '06-30'],
  3: ['07-01', '09-30'],
  4: ['10-01', '12-31'],
}

function quarterRange(year: number, q: Quarter) {
  const [start, end] = QUARTER_BOUNDS[q]
  return { desde: `${year}-${start}`, hasta: `${year}-${end}` }
}

function guessCurrentQuarter(): Quarter {
  return (Math.ceil((new Date().getMonth() + 1) / 3)) as Quarter
}

const CURRENT_YEAR = new Date().getFullYear()

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i).map((y) => ({
  label: String(y),
  value: y,
}))

const QUARTER_OPTIONS = [
  { label: 'Q1 — Ene · Feb · Mar', value: 1 },
  { label: 'Q2 — Abr · May · Jun', value: 2 },
  { label: 'Q3 — Jul · Ago · Sep', value: 3 },
  { label: 'Q4 — Oct · Nov · Dic', value: 4 },
]

const ESTADO_COLORS: Record<string, string> = {
  EMITIDA: 'blue',
  PAGADA: 'green',
  VENCIDA: 'red',
  ANULADA: 'default',
}

// ── Page ────────────────────────────────────────────────────────────────────

export function CierreTrimestralPage() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [quarter, setQuarter] = useState<Quarter>(guessCurrentQuarter())

  // All invoices loaded once — filtering is done in memory
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [exporting, setExporting] = useState(false)

  const refresh = useCallback(() => setTick((n) => n + 1), [])

  // Load all invoices on mount (and on refresh).
  // Year/quarter changes only filter the already-loaded list — no extra network call.
  // NOTE: pageSize 500 covers typical billing volumes. If the total exceeds that,
  // a backend endpoint with ?fechaDesde&fechaHasta would be the right next step.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    invoicesService
      .getAll({ pageSize: 500 })
      .then((res) => {
        if (!cancelled) {
          setAllInvoices(res.data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err))
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [tick])

  // Filter by selected quarter — pure in-memory, instant UX
  const { desde, hasta } = quarterRange(year, quarter)

  const invoices = useMemo(
    () =>
      allInvoices.filter((inv) => {
        const fecha = inv.fechaEmision.slice(0, 10) // YYYY-MM-DD
        return fecha >= desde && fecha <= hasta
      }),
    [allInvoices, desde, hasta]
  )

  // Totals calculated from the filtered set
  const totals = useMemo(
    () => ({
      count: invoices.length,
      baseImponible: invoices.reduce((s, i) => s + i.baseImponible, 0),
      impuestos: invoices.reduce((s, i) => s + i.impuestos, 0),
      total: invoices.reduce((s, i) => s + i.total, 0),
    }),
    [invoices]
  )

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

  const handleExport = () => {
    if (invoices.length === 0) return
    setExporting(true)
    try {
      exportInvoicesToCsv(invoices, `cierre-trimestral-${year}-Q${quarter}.csv`)
    } finally {
      setExporting(false)
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
      title: 'Nombre factura',
      key: 'nombre',
      ellipsis: true,
      render: (_, inv) => inv.pdfFileName ?? `FAC-${inv.numeroFactura}`,
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
      title: 'PDF',
      dataIndex: 'pdfFileName',
      key: 'pdf',
      width: 55,
      align: 'center',
      render: (v: string | undefined, inv: Invoice) =>
        v ? (
          <Tooltip title="Descargar PDF">
            <Button
              type="text"
              size="small"
              icon={<FilePdfOutlined style={{ color: '#ff4d4f' }} />}
              loading={downloadingId === inv.id}
              onClick={() => handleDownloadPdf(inv.id)}
            />
          </Tooltip>
        ) : (
          '—'
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 65,
      render: (_, inv) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => setSelectedInvoiceId(inv.id)}>
          Ver
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Cierre trimestral"
        subtitle="Resumen de facturación por trimestre"
        actions={
          <Button
            icon={<ExportOutlined />}
            loading={exporting}
            disabled={invoices.length === 0}
            onClick={handleExport}
          >
            Exportar CSV
          </Button>
        }
      />

      {/* Selectors */}
      <Card style={{ marginBottom: 16 }}>
        <Select
          value={year}
          options={YEAR_OPTIONS}
          onChange={setYear}
          style={{ width: 100, marginRight: 12 }}
        />
        <Select
          value={quarter}
          options={QUARTER_OPTIONS}
          onChange={setQuarter}
          style={{ width: 240 }}
        />
      </Card>

      {/* Summary cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Facturas incluidas"
              value={totals.count}
              suffix="facturas"
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Base imponible"
              value={formatCurrency(totals.baseImponible)}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="IVA"
              value={formatCurrency(totals.impuestos)}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total facturado"
              value={formatCurrency(totals.total)}
              valueStyle={{ color: '#1677ff', fontWeight: 700 }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        {loading && <Spin style={{ display: 'block', textAlign: 'center', padding: 32 }} />}
        {error && !loading && (
          <Alert
            type="error"
            message={error}
            action={<Button size="small" onClick={refresh}>Reintentar</Button>}
            style={{ marginBottom: 16 }}
          />
        )}
        {!loading && (
          <Table<Invoice>
            rowKey="id"
            columns={columns}
            dataSource={invoices}
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: (
                <EmptyState
                  description={`No hay facturas en ${year} Q${quarter}`}
                />
              ),
            }}
            summary={
              invoices.length > 0
                ? () => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <strong>Totales</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <strong>{formatCurrency(totals.baseImponible)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <strong>{formatCurrency(totals.impuestos)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <strong>{formatCurrency(totals.total)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} colSpan={2} />
                    </Table.Summary.Row>
                  )
                : undefined
            }
            pagination={{
              pageSize: 20,
              showSizeChanger: false,
              showTotal: (t) => `${t} facturas`,
              hideOnSinglePage: true,
            }}
          />
        )}
      </Card>

      <InvoiceDetailModal
        invoiceId={selectedInvoiceId}
        open={!!selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
      />
    </div>
  )
}
