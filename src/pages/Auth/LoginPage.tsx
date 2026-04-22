import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, Alert, Space } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { useAuth } from '@/store/auth/AuthContext'
import type { LoginCredentials } from '@/types'

const { Title, Text } = Typography

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: LoginCredentials) => {
    setError(null)
    setLoading(true)
    try {
      await login(values)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      style={{
        width: 400,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        borderRadius: 12,
      }}
    >
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: '#1677ff',
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 16,
            }}
          >
            RJ
          </div>
          <Title level={4} style={{ margin: 0 }}>
            RJMA BackOffice
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Acceso restringido — solo administradores
          </Text>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon closable onClose={() => setError(null)} />
        )}

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Introduce tu email' },
              { type: 'email', message: 'Email no válido' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="admin@rjma.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[{ required: true, message: 'Introduce tu contraseña' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="••••••••"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              Iniciar sesión
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary" style={{ fontSize: 11, textAlign: 'center', display: 'block' }}>
          Demo: admin@rjma.com / admin123
        </Text>
      </Space>
    </Card>
  )
}
