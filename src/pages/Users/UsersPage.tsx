import { Button, Card, Table, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'

const columns = [
  { title: 'Nombre', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  {
    title: 'Rol',
    dataIndex: 'role',
    key: 'role',
    render: (role: string) => role ? <Tag color="blue">{role}</Tag> : null,
  },
  { title: 'Último acceso', dataIndex: 'lastLogin', key: 'lastLogin' },
  {
    title: 'Estado',
    dataIndex: 'active',
    key: 'active',
    render: (active: boolean) =>
      active !== undefined ? (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'Activo' : 'Inactivo'}
        </Tag>
      ) : null,
  },
  { title: 'Acciones', key: 'actions', width: 120 },
]

export function UsersPage() {
  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de usuarios del sistema"
        actions={
          <Button type="primary" icon={<PlusOutlined />} disabled>
            Nuevo usuario
          </Button>
        }
      />

      <Card>
        <Table
          columns={columns}
          dataSource={[]}
          locale={{
            emptyText: (
              <EmptyState description="No hay usuarios registrados" />
            ),
          }}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  )
}
