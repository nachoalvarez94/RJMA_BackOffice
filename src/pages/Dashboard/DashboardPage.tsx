import { useMemo } from 'react'
import { Alert, Button, Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Invoice, Order } from '@/types'
import { PageHeader } from '@/components/common/PageHeader'
import { useDashboard } from '@/hooks/useDashboard'
import { useNameResolver } from '@/hooks/useNameResolver'
import { clientsService } from '@/services/api/clients'
import type { TopItem } from './dashboardCalc'
import { formatCurrency, formatDate } from '@/lib/format'

const { Text } = Typography

// ── Colour helpers ────────────────────────────────────────────────────────────

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'orange',
  COMPLETADO: 'green',
  CANCELADO: 'red',
  FACTURADO: 'blue',
  BORRADOR: 'default',
}

// ── Column definitions ────────────────────────────────────────────────────────

const ultimasFacturasColumns: ColumnsType<Invoice> = [
  {
    title: 'Nº',
    dataIndex: 'numeroFactura',
    key: 'num',
    width: 55,
  },
  {
    title: 'Fecha',
    dataIndex: 'fechaEmision',
    key: 'fecha',
    width: 100,
    render: (v: string) => formatDate(v),
  },
  {
    title: 'Cliente',
    dataIndex: 'nombreCliente',
    key: 'cliente',
    ellipsis: true,
    render: (v: string) => v?.trim() || '—',
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    width: 110,
    align: 'right',
    render: (v: number) => <strong>{formatCurrency(v)}</strong>,
  },
]

const topClientesColumns: ColumnsType<TopItem> = [
  {
    title: 'Cliente',
    dataIndex: 'nombre',
    key: 'nombre',
    ellipsis: true,
  },
  {
    title: 'Fact.',
    dataIndex: 'count',
    key: 'count',
    width: 50,
    align: 'right',
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    width: 110,
    align: 'right',
    render: (v: number) => formatCurrency(v),
  },
]

const vendedorColumns: ColumnsType<TopItem> = [
  {
    title: 'Vendedor',
    dataIndex: 'nombre',
    key: 'nombre',
    ellipsis: true,
  },
  {
    title: 'Fact.',
    dataIndex: 'count',
    key: 'count',
    width: 50,
    align: 'right',
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    width: 110,
    align: 'right',
    render: (v: number) => formatCurrency(v),
  },
]

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data, loading, error, refresh } = useDashboard()

  // Resolve client names for the pendientes table (Order has clienteId, not nombreCliente)
  const clientIds = useMemo(
    () => (data?.pendientesFacturacion ?? []).map((o) => o.clienteId),
    [data]
  )
  const resolveClientName = useNameResolver('clients', clientIds, (id) =>
    clientsService.getById(String(id)).then((c) => c.nombre?.trim() || `#${id}`)
  )

  const pendientesColumns: ColumnsType<Order> = useMemo(
    () => [
      {
        title: 'Pedido',
        dataIndex: 'numero',
        key: 'numero',
        width: 70,
        render: (v: number) => `#${v}`,
      },
      {
        title: 'Fecha',
        dataIndex: 'fecha',
        key: 'fecha',
        width: 100,
        render: (v: string) => formatDate(v),
      },
      {
        title: 'Cliente',
        dataIndex: 'clienteId',
        key: 'cliente',
        ellipsis: true,
        render: (id: number) => resolveClientName(id),
      },
      {
        title: 'Estado',
        dataIndex: 'estado',
        key: 'estado',
        width: 90,
        render: (v: string) => <Tag color={ESTADO_COLORS[v] ?? 'default'}>{v}</Tag>,
      },
      {
        title: 'Total',
        dataIndex: 'totalFinal',
        key: 'total',
        width: 110,
        align: 'right',
        render: (v: number) => formatCurrency(v),
      },
    ],
    [resolveClientName]
  )

  const d = data

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen general del sistema"
        actions={
          <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
            Actualizar
          </Button>
        }
      />

      {error && (
        <Alert
          type="error"
          message={error}
          action={<Button size="small" onClick={refresh}>Reintentar</Button>}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* ── KPI row 1: monetary ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Facturación este mes"
              value={formatCurrency(d?.facturasMes.total ?? 0)}
              loading={loading}
              valueStyle={{ color: '#1677ff', fontWeight: 700 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Base {formatCurrency(d?.facturasMes.base ?? 0)} · IVA {formatCurrency(d?.facturasMes.iva ?? 0)}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Facturación trimestre"
              value={formatCurrency(d?.facturasTrimestre.total ?? 0)}
              loading={loading}
              valueStyle={{ color: '#52c41a', fontWeight: 700 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Base {formatCurrency(d?.facturasTrimestre.base ?? 0)} · IVA {formatCurrency(d?.facturasTrimestre.iva ?? 0)}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total pendiente de cobro"
              value={formatCurrency(d?.totalPendienteCobro ?? 0)}
              loading={loading}
              valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              En {d?.pedidosPendientesCobro ?? 0} pedido{(d?.pedidosPendientesCobro ?? 0) !== 1 ? 's' : ''}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* ── KPI row 2: counts ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Facturas emitidas (mes)"
              value={d?.facturasMes.count ?? 0}
              suffix="facturas"
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Facturas emitidas (trimestre)"
              value={d?.facturasTrimestre.count ?? 0}
              suffix="facturas"
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Pedidos pendientes de facturar"
              value={d?.pedidosPendientesFacturar ?? 0}
              suffix="pedidos"
              loading={loading}
              valueStyle={
                (d?.pedidosPendientesFacturar ?? 0) > 0 ? { color: '#fa8c16' } : undefined
              }
            />
          </Card>
        </Col>
      </Row>

      {/* ── Tables row 1: últimas facturas + top clientes ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Últimas facturas emitidas" size="small">
            <Table<Invoice>
              rowKey="id"
              size="small"
              columns={ultimasFacturasColumns}
              dataSource={d?.ultimasFacturas ?? []}
              loading={loading}
              pagination={false}
              locale={{ emptyText: 'Sin datos' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Top 5 clientes (total facturado)" size="small">
            <Table<TopItem>
              rowKey="nombre"
              size="small"
              columns={topClientesColumns}
              dataSource={d?.topClientes ?? []}
              loading={loading}
              pagination={false}
              locale={{ emptyText: 'Sin datos' }}
            />
          </Card>
        </Col>
      </Row>

      {/* ── Tables row 2: pendientes facturación + vendedores ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Pedidos pendientes de facturar" size="small">
            <Table<Order>
              rowKey="id"
              size="small"
              columns={pendientesColumns}
              dataSource={d?.pendientesFacturacion ?? []}
              loading={loading}
              pagination={{ pageSize: 5, hideOnSinglePage: true, showSizeChanger: false }}
              locale={{ emptyText: 'Ningún pedido pendiente' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Facturación por vendedor" size="small">
            <Table<TopItem>
              rowKey="nombre"
              size="small"
              columns={vendedorColumns}
              dataSource={d?.facturacionVendedor ?? []}
              loading={loading}
              pagination={{ pageSize: 5, hideOnSinglePage: true, showSizeChanger: false }}
              locale={{ emptyText: 'Sin datos' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
