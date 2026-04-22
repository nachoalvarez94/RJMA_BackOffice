import { Button, Card, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'

const columns = [
  { title: 'Nombre', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Teléfono', dataIndex: 'phone', key: 'phone' },
  { title: 'Estado', dataIndex: 'status', key: 'status' },
  { title: 'Acciones', key: 'actions', width: 120 },
]

export function ClientsPage() {
  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Gestión del listado de clientes"
        actions={
          <Button type="primary" icon={<PlusOutlined />} disabled>
            Nuevo cliente
          </Button>
        }
      />

      <Card>
        <Table
          columns={columns}
          dataSource={[]}
          locale={{
            emptyText: (
              <EmptyState
                description="No hay clientes registrados"
                actionLabel="Nuevo cliente"
                onAction={() => {}}
              />
            ),
          }}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  )
}
