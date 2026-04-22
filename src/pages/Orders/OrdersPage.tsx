import { Card, Table, Tag } from 'antd'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'

const columns = [
  { title: 'Nº Pedido', dataIndex: 'orderNumber', key: 'orderNumber' },
  { title: 'Cliente', dataIndex: 'client', key: 'client' },
  { title: 'Fecha', dataIndex: 'date', key: 'date' },
  { title: 'Total', dataIndex: 'total', key: 'total' },
  {
    title: 'Estado',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => status ? <Tag>{status}</Tag> : null,
  },
  { title: 'Acciones', key: 'actions', width: 120 },
]

export function OrdersPage() {
  return (
    <div>
      <PageHeader
        title="Pedidos"
        subtitle="Visualización global de pedidos"
      />

      <Card>
        <Table
          columns={columns}
          dataSource={[]}
          locale={{
            emptyText: (
              <EmptyState description="No hay pedidos registrados" />
            ),
          }}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  )
}
