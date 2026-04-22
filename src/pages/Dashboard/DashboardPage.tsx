import { Row, Col, Card, Statistic, Typography } from 'antd'
import {
  TeamOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { PageHeader } from '@/components/common/PageHeader'

const { Text } = Typography

const stats = [
  { label: 'Clientes', value: '—', icon: <TeamOutlined />, color: '#1677ff' },
  { label: 'Productos', value: '—', icon: <AppstoreOutlined />, color: '#52c41a' },
  { label: 'Pedidos', value: '—', icon: <ShoppingCartOutlined />, color: '#fa8c16' },
  { label: 'Facturas', value: '—', icon: <FileTextOutlined />, color: '#722ed1' },
]

export function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen general del sistema"
      />

      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.label}>
            <Card>
              <Statistic
                title={stat.label}
                value={stat.value}
                prefix={
                  <span style={{ color: stat.color, marginRight: 4 }}>
                    {stat.icon}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Las métricas se cargarán cuando el backend esté disponible.
              Conectar en <code>src/services/api/</code>.
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
