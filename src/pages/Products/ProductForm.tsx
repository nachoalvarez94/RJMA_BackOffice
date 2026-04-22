import { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Button } from 'antd'
import type { Product, CreateProductDto, UpdateProductDto } from '@/types'

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
          ? { nombre: product.nombre, referencia: product.referencia, precio: product.precio, descripcion: product.descripcion }
          : { nombre: '', referencia: '', precio: undefined, descripcion: '' }
      )
    }
  }, [open, product, form])

  const handleFinish = async (values: CreateProductDto) => {
    await onSubmit(values)
  }

  return (
    <Modal
      title={isEdit ? 'Editar producto' : 'Nuevo producto'}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
        style={{ marginTop: 16 }}
        requiredMark={false}
      >
        <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Requerido' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="referencia" label="Referencia" rules={[{ required: true, message: 'Requerido' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="precio" label="Precio (€)" rules={[{ required: true, message: 'Requerido' }]}>
          <InputNumber
            min={0}
            precision={2}
            style={{ width: '100%' }}
            addonAfter="€"
          />
        </Form.Item>
        <Form.Item name="descripcion" label="Descripción">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancelar
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
