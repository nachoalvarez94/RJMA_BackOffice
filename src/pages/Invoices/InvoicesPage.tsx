import { Button, Card, Table, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'

const columns = [
  { title: 'Nº Factura', dataIndex: 'invoiceNumber', key: 'invoiceNumber' },
  { title: 'Cliente', dataIndex: 'client', key: 'client' },
  { title: 'Fecha', dataIndex: 'date', key: 'date' },
  { title: 'Importe', dataIndex: 'amount', key: 'amount' },
  {
    title: 'Estado',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => status ? <Tag>{status}</Tag> : null,
  },
  { title: 'Acciones', key: 'actions', width: 120 },
]

export function InvoicesPage() {
  return (
    <div>
      <PageHeader
        title="Facturas"
        subtitle="Visualización y gestión de facturas"
        actions={
          <Button type="primary" icon={<PlusOutlined />} disabled>
            Nueva factura
          </Button>
        }
      />

      <Card>
        <Table
          columns={columns}
          dataSource={[]}
          locale={{
            emptyText: (
              <EmptyState description="No hay facturas registradas" />
            ),
          }}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  )
}
