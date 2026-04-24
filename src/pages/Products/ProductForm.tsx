import { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Select, Switch } from 'antd'
import type { Product, CreateProductDto, UpdateProductDto } from '@/types'

const UNIDAD_VENTA_OPTIONS = [
  { label: 'UNIDAD', value: 'UNIDAD' },
  { label: 'CAJA',   value: 'CAJA' },
  { label: 'GRANEL', value: 'GRANEL' },
  { label: 'PESO',   value: 'PESO' },
]

interface ProductFormProps {
  open: boolean
  product: Product | null
  loading: boolean
  onSubmit: (dto: CreateProductDto | UpdateProductDto) => Promise<void>
  onCancel: () => void
}

export function ProductForm({ open, product, loading, onSubmit, onCancel }: ProductFormProps) {
  const [form] = Form.useForm<CreateProductDto>()
  const isEdit = !!product

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        product
          ? {
              nombre:        product.nombre?.trim()        ?? '',
              codigoInterno: product.codigoInterno?.trim() ?? '',
              codigoBarras:  product.codigoBarras?.trim()  ?? '',
              precio:        product.precio,
              activo:        product.activo,
              unidadVenta:   product.unidadVenta,
            }
          : { nombre: '', codigoInterno: '', codigoBarras: '', precio: undefined, activo: true, unidadVenta: 'UNIDAD' }
      )
    }
  }, [open, product, form])

  return (
    <Modal
      title={isEdit ? 'Editar producto' : 'Nuevo producto'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={isEdit ? 'Guardar cambios' : 'Crear producto'}
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnClose
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        autoComplete="off"
        style={{ marginTop: 16 }}
        requiredMark={false}
      >
        <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Requerido' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="codigoInterno" label="Código interno">
          <Input />
        </Form.Item>

        <Form.Item name="codigoBarras" label="Código de barras">
          <Input placeholder="Dejar vacío si no aplica" />
        </Form.Item>

        <Form.Item name="precio" label="Precio (€)" rules={[{ required: true, message: 'Requerido' }]}>
          <InputNumber min={0} precision={2} style={{ width: '100%' }} addonAfter="€" />
        </Form.Item>

        <Form.Item name="unidadVenta" label="Unidad de venta" rules={[{ required: true, message: 'Requerido' }]}>
          <Select options={UNIDAD_VENTA_OPTIONS} />
        </Form.Item>

        {isEdit && (
          <Form.Item name="activo" label="Estado" valuePropName="checked">
            <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}
