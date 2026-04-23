import { useEffect } from 'react'
import { Modal, Form, Input, Select, Button } from 'antd'
import type { AdminUser, CreateUserDto, UpdateUserDto } from '@/types'

interface UserFormProps {
  open: boolean
  user: AdminUser | null
  loading: boolean
  onSubmit: (dto: CreateUserDto | UpdateUserDto) => Promise<void>
  onCancel: () => void
}

export function UserForm({ open, user, loading, onSubmit, onCancel }: UserFormProps) {
  const [form] = Form.useForm()
  const isEdit = !!user

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        user
          ? { nombre: user.nombre, email: user.email }
          : { nombre: '', email: '', password: '', rol: 'USER' }
      )
    }
  }, [open, user, form])

  const handleFinish = async (values: CreateUserDto | UpdateUserDto) => {
    await onSubmit(values)
  }

  return (
    <Modal
      title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={480}
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
        {!isEdit && (
          <>
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[{ required: true, min: 8, message: 'Mínimo 8 caracteres' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item name="rol" label="Rol" rules={[{ required: true, message: 'Requerido' }]}>
              <Select
                options={[
                  { label: 'Administrador', value: 'ADMIN' },
                  { label: 'Usuario', value: 'USER' },
                ]}
              />
            </Form.Item>
          </>
        )}
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancelar
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
