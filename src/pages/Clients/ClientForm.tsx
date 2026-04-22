import { useEffect } from 'react'
import { Modal, Form, Input, Button } from 'antd'
import type { Client, CreateClientDto, UpdateClientDto } from '@/types'

interface ClientFormProps {
  open: boolean
  client: Client | null
  loading: boolean
  onSubmit: (dto: CreateClientDto | UpdateClientDto) => Promise<void>
  onCancel: () => void
}

export function ClientForm({ open, client, loading, onSubmit, onCancel }: ClientFormProps) {
  const [form] = Form.useForm<CreateClientDto>()
  const isEdit = !!client

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        client
          ? { nombre: client.nombre, email: client.email, telefono: client.telefono, direccion: client.direccion, nif: client.nif }
          : { nombre: '', email: '', telefono: '', direccion: '', nif: '' }
      )
    }
  }, [open, client, form])

  const handleFinish = async (values: CreateClientDto) => {
    await onSubmit(values)
  }

  return (
    <Modal
      title={isEdit ? 'Editar cliente' : 'Nuevo cliente'}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={560}
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
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: 'email', message: 'Email válido requerido' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="telefono" label="Teléfono">
          <Input />
        </Form.Item>
        <Form.Item name="direccion" label="Dirección">
          <Input />
        </Form.Item>
        <Form.Item name="nif" label="NIF / CIF">
          <Input />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancelar
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
