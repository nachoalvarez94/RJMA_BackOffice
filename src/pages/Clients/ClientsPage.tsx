import { useState, useCallback } from 'react'
import { Button, Card, Input, Select, Space, Table, Popconfirm, message } from 'antd'
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Client, CreateClientDto, UpdateClientDto } from '@/types'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useClients } from '@/hooks/useClients'
import { clientsService } from '@/services/api/clients'
import { getErrorMessage } from '@/lib/apiError'
import { ClientForm } from './ClientForm'

export function ClientsPage() {
  const { clients, total, loading, error, page, pageSize, setPage, setFilters, refresh } =
    useClients()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [saving, setSaving] = useState(false)
  const [nombreInput, setNombreInput] = useState('')
  const [activoInput, setActivoInput] = useState<boolean | undefined>(undefined)

  const openCreate = () => { setEditingClient(null); setModalOpen(true) }
  const openEdit = (client: Client) => { setEditingClient(client); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditingClient(null) }

  const handleSubmit = useCallback(
    async (dto: CreateClientDto | UpdateClientDto) => {
      setSaving(true)
      try {
        if (editingClient) {
          await clientsService.update(editingClient.id, dto as UpdateClientDto)
          message.success('Cliente actualizado correctamente')
        } else {
          await clientsService.create(dto as CreateClientDto)
          message.success('Cliente creado correctamente')
        }
        closeModal()
        refresh()
      } catch (err) {
        message.error(getErrorMessage(err))
      } finally {
        setSaving(false)
      }
    },
    [editingClient, refresh]
  )

  const handleToggleActivo = useCallback(
    async (client: Client) => {
      try {
        if (client.activo) {
          await clientsService.desactivar(client.id)
          message.success('Cliente desactivado')
        } else {
          await clientsService.activar(client.id)
          message.success('Cliente activado')
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

  const t = (v?: string) => v?.trim() || '—'

  const columns: ColumnsType<Client> = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      ellipsis: true,
      render: (v: string) => t(v),
    },
    {
      title: 'Nombre comercial',
      dataIndex: 'nombreComercio',
      key: 'nombreComercio',
      ellipsis: true,
      render: (v?: string) => t(v),
    },
    {
      title: 'Doc. fiscal',
      dataIndex: 'documentoFiscal',
      key: 'documentoFiscal',
      width: 140,
      render: (v?: string) => t(v),
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
      width: 120,
      render: (v?: string) => t(v),
    },
    {
      title: 'Población',
      dataIndex: 'poblacion',
      key: 'poblacion',
      ellipsis: true,
      render: (v?: string) => t(v),
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
      width: 180,
      render: (_, client) => (
        <Space>
          <Button size="small" onClick={() => openEdit(client)}>
            Editar
          </Button>
          <Popconfirm
            title={client.activo ? '¿Desactivar este cliente?' : '¿Activar este cliente?'}
            onConfirm={() => handleToggleActivo(client)}
            okText="Sí"
            cancelText="No"
          >
            <Button size="small" danger={client.activo}>
              {client.activo ? 'Desactivar' : 'Activar'}
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
        title="Clientes"
        subtitle="Gestión del listado de clientes"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Nuevo cliente
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
          <Button type="primary" onClick={handleSearch}>
            Buscar
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleClear}>
            Limpiar
          </Button>
        </Space>
      </Card>

      <Card>
        <Table<Client>
          rowKey="id"
          columns={columns}
          dataSource={clients}
          loading={loading}
          locale={{
            emptyText: (
              <EmptyState
                description="No hay clientes registrados"
                actionLabel="Nuevo cliente"
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
            showTotal: (t) => `${t} clientes`,
          }}
        />
      </Card>

      <ClientForm
        open={modalOpen}
        client={editingClient}
        loading={saving}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />
    </div>
  )
}
