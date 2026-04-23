import { useEffect } from 'react'
import { Modal, Form, Input, Switch } from 'antd'
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
          ? {
              nombre:          client.nombre?.trim()          ?? '',
              nombreComercio:  client.nombreComercio?.trim()  ?? '',
              documentoFiscal: client.documentoFiscal?.trim() ?? '',
              telefono:        client.telefono?.trim()        ?? '',
              direccion:       client.direccion?.trim()       ?? '',
              poblacion:       client.poblacion?.trim()       ?? '',
              activo:          client.activo,
            }
          : {
              nombre: '', nombreComercio: '', documentoFiscal: '',
              telefono: '', direccion: '', poblacion: '', activo: true,
            }
      )
    }
  }, [open, client, form])

  return (
    <Modal
      title={isEdit ? 'Editar cliente' : 'Nuevo cliente'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={isEdit ? 'Guardar cambios' : 'Crear cliente'}
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnClose
      width={560}
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

        <Form.Item name="nombreComercio" label="Nombre comercial">
          <Input />
        </Form.Item>

        <Form.Item name="documentoFiscal" label="Documento fiscal (NIF / CIF / NNE)">
          <Input />
        </Form.Item>

        <Form.Item name="telefono" label="Teléfono">
          <Input />
        </Form.Item>

        <Form.Item name="direccion" label="Dirección">
          <Input />
        </Form.Item>

        <Form.Item name="poblacion" label="Población">
          <Input />
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
