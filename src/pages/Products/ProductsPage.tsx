import { Button, Card, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'

const columns = [
  { title: 'Nombre', dataIndex: 'name', key: 'name' },
  { title: 'Referencia', dataIndex: 'ref', key: 'ref' },
  { title: 'Precio', dataIndex: 'price', key: 'price' },
  { title: 'Stock', dataIndex: 'stock', key: 'stock' },
  { title: 'Estado', dataIndex: 'status', key: 'status' },
  { title: 'Acciones', key: 'actions', width: 120 },
]

export function ProductsPage() {
  return (
    <div>
      <PageHeader
        title="Productos"
        subtitle="Catálogo y gestión de productos"
        actions={
          <Button type="primary" icon={<PlusOutlined />} disabled>
            Nuevo producto
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
                description="No hay productos registrados"
                actionLabel="Nuevo producto"
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
