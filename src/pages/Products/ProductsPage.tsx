import { useState, useCallback } from 'react'
import { Button, Card, Input, Select, Space, Table, Popconfirm, message } from 'antd'
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Product, CreateProductDto, UpdateProductDto } from '@/types'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusTag } from '@/components/common/StatusTag'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useProducts } from '@/hooks/useProducts'
import { productsService } from '@/services/api/products'
import { getErrorMessage } from '@/lib/apiError'
import { formatCurrency } from '@/lib/format'
import { ProductForm } from './ProductForm'

export function ProductsPage() {
  const { products, total, loading, error, page, pageSize, setPage, setFilters, refresh } =
    useProducts()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [nombreInput, setNombreInput] = useState('')
  const [activoInput, setActivoInput] = useState<boolean | undefined>(undefined)

  const openCreate = () => { setEditingProduct(null); setModalOpen(true) }
  const openEdit = (p: Product) => { setEditingProduct(p); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditingProduct(null) }

  const handleSubmit = useCallback(
    async (dto: CreateProductDto | UpdateProductDto) => {
      setSaving(true)
      try {
        if (editingProduct) {
          await productsService.update(editingProduct.id, dto as UpdateProductDto)
          message.success('Producto actualizado correctamente')
        } else {
          await productsService.create(dto as CreateProductDto)
          message.success('Producto creado correctamente')
        }
        closeModal()
        refresh()
      } catch (err) {
        message.error(getErrorMessage(err))
      } finally {
        setSaving(false)
      }
    },
    [editingProduct, refresh]
  )

  const handleToggleActivo = useCallback(
    async (product: Product) => {
      try {
        if (product.activo) {
          await productsService.desactivar(product.id)
          message.success('Producto desactivado')
        } else {
          await productsService.activar(product.id)
          message.success('Producto activado')
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

  const t = (v?: string | null) => v?.trim() || '—'

  const columns: ColumnsType<Product> = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      ellipsis: true,
      render: (v: string) => t(v),
    },
    {
      title: 'Cód. interno',
      dataIndex: 'codigoInterno',
      key: 'codigoInterno',
      width: 120,
      render: (v?: string) => t(v),
    },
    {
      title: 'Cód. barras',
      dataIndex: 'codigoBarras',
      key: 'codigoBarras',
      width: 140,
      render: (v?: string | null) => t(v),
    },
    {
      title: 'Unidad venta',
      dataIndex: 'unidadVenta',
      key: 'unidadVenta',
      width: 120,
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      width: 100,
      align: 'right',
      render: (v: number) => formatCurrency(v),
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
      render: (_, product) => (
        <Space>
          <Button size="small" onClick={() => openEdit(product)}>
            Editar
          </Button>
          <Popconfirm
            title={product.activo ? '¿Desactivar este producto?' : '¿Activar este producto?'}
            onConfirm={() => handleToggleActivo(product)}
            okText="Sí"
            cancelText="No"
          >
            <Button size="small" danger={product.activo}>
              {product.activo ? 'Desactivar' : 'Activar'}
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
        title="Productos"
        subtitle="Catálogo y gestión de productos"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Nuevo producto
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
        <Table<Product>
          rowKey="id"
          columns={columns}
          dataSource={products}
          loading={loading}
          locale={{
            emptyText: (
              <EmptyState
                description="No hay productos registrados"
                actionLabel="Nuevo producto"
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
            showTotal: (t) => `${t} productos`,
          }}
        />
      </Card>

      <ProductForm
        open={modalOpen}
        product={editingProduct}
        loading={saving}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />
    </div>
  )
}
