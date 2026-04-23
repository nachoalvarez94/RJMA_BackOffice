import { useState, useCallback } from 'react'
import {
  Button, Card, Input, Select, Space, Table, Tag, Popconfirm, message, Modal,
} from 'antd'
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { AdminUser, CreateUserDto, UpdateUserDto, RolUsuario } from '@/types'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useUsers } from '@/hooks/useUsers'
import { usersService } from '@/services/api/users'
import { getErrorMessage } from '@/lib/apiError'
import { formatDateTime } from '@/lib/format'
import { UserForm } from './UserForm'

const ROL_COLORS: Record<RolUsuario, string> = {
  ADMIN: 'blue',
  USER: 'default',
}

export function UsersPage() {
  const { users, total, loading, error, page, pageSize, setPage, setFilters, refresh } =
    useUsers()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [saving, setSaving] = useState(false)
  const [nombreInput, setNombreInput] = useState('')
  const [activoInput, setActivoInput] = useState<boolean | undefined>(undefined)

  const openCreate = () => { setEditingUser(null); setModalOpen(true) }
  const openEdit = (u: AdminUser) => { setEditingUser(u); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditingUser(null) }

  const handleSubmit = useCallback(
    async (dto: CreateUserDto | UpdateUserDto) => {
      setSaving(true)
      try {
        if (editingUser) {
          await usersService.update(editingUser.id, dto as UpdateUserDto)
          message.success('Usuario actualizado correctamente')
        } else {
          await usersService.create(dto as CreateUserDto)
          message.success('Usuario creado correctamente')
        }
        closeModal()
        refresh()
      } catch (err) {
        message.error(getErrorMessage(err))
      } finally {
        setSaving(false)
      }
    },
    [editingUser, refresh]
  )

  const handleChangeRol = useCallback(
    (user: AdminUser) => {
      const nuevoRol: RolUsuario = user.rol === 'ADMIN' ? 'USER' : 'ADMIN'
      Modal.confirm({
        title: 'Cambiar rol',
        content: `¿Cambiar el rol de ${user.nombre} a "${nuevoRol}"?`,
        okText: 'Cambiar',
        cancelText: 'Cancelar',
        onOk: async () => {
          try {
            await usersService.changeRol(user.id, { rol: nuevoRol })
            message.success(`Rol cambiado a ${nuevoRol}`)
            refresh()
          } catch (err) {
            message.error(getErrorMessage(err))
          }
        },
      })
    },
    [refresh]
  )

  const handleToggleActivo = useCallback(
    async (user: AdminUser) => {
      try {
        if (user.activo) {
          await usersService.desactivar(user.id)
          message.success('Usuario desactivado')
        } else {
          await usersService.activar(user.id)
          message.success('Usuario activado')
        }
        refresh()
      } catch (err) {
        message.error(getErrorMessage(err))
      }
    },
    [refresh]
  )

  const handleSearch = () =>
    setFilters({ nombre: nombreInput || undefined, activo: activoInput })

  const handleClear = () => {
    setNombreInput('')
    setActivoInput(undefined)
    setFilters({})
  }

  const columns: ColumnsType<AdminUser> = [
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Rol',
      dataIndex: 'rol',
      key: 'rol',
      render: (rol: RolUsuario) => <Tag color={ROL_COLORS[rol]}>{rol}</Tag>,
    },
    {
      title: 'Último acceso',
      dataIndex: 'ultimoAcceso',
      key: 'ultimoAcceso',
      render: (v?: string) => (v ? formatDateTime(v) : '—'),
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      width: 100,
      render: (activo: boolean) => <StatusTag activo={activo} />,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 260,
      render: (_, user) => (
        <Space>
          <Button size="small" onClick={() => openEdit(user)}>
            Editar
          </Button>
          <Button size="small" onClick={() => handleChangeRol(user)}>
            Cambiar rol
          </Button>
          <Popconfirm
            title={user.activo ? '¿Desactivar este usuario?' : '¿Activar este usuario?'}
            onConfirm={() => handleToggleActivo(user)}
            okText="Sí"
            cancelText="No"
          >
            <Button size="small" danger={user.activo}>
              {user.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (error && !loading) return <ErrorState message={error} onRetry={refresh} />

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de usuarios del sistema"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Nuevo usuario
          </Button>
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Buscar por nombre"
            value={nombreInput}
            onChange={(e) => setNombreInput(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Select
            placeholder="Estado"
            value={activoInput}
            onChange={setActivoInput}
            allowClear
            style={{ width: 140 }}
            options={[
              { label: 'Activo', value: true },
              { label: 'Inactivo', value: false },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>Buscar</Button>
          <Button icon={<ReloadOutlined />} onClick={handleClear}>Limpiar</Button>
        </Space>
      </Card>

      <Card>
        <Table<AdminUser>
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={loading}
          locale={{
            emptyText: (
              <EmptyState
                description="No hay usuarios registrados"
                actionLabel="Nuevo usuario"
                onAction={openCreate}
              />
            ),
          }}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: setPage,
            showSizeChanger: false,
            showTotal: (t) => `${t} usuarios`,
          }}
        />
      </Card>

      <UserForm
        open={modalOpen}
        user={editingUser}
        loading={saving}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />
    </div>
  )
}
