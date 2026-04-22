import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Typography, theme, Space } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/store/auth/AuthContext'

const { Sider, Header, Content } = Layout
const { Text } = Typography

const SIDEBAR_WIDTH = 220
const SIDEBAR_COLLAPSED_WIDTH = 60

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/clientes',
    icon: <TeamOutlined />,
    label: 'Clientes',
  },
  {
    key: '/productos',
    icon: <AppstoreOutlined />,
    label: 'Productos',
  },
  {
    key: '/pedidos',
    icon: <ShoppingCartOutlined />,
    label: 'Pedidos',
  },
  {
    key: '/facturas',
    icon: <FileTextOutlined />,
    label: 'Facturas',
  },
  {
    key: '/usuarios',
    icon: <UserOutlined />,
    label: 'Usuarios',
  },
]

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { token: designToken } = theme.useToken()

  const userMenuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar sesión',
      danger: true,
    },
  ]

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') logout()
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
        collapsed={collapsed}
        style={{
          background: designToken.colorBgContainer,
          borderRight: `1px solid ${designToken.colorBorderSecondary}`,
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            borderBottom: `1px solid ${designToken.colorBorderSecondary}`,
            gap: 10,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: designToken.colorPrimary,
              borderRadius: 6,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            RJ
          </div>
          {!collapsed && (
            <Text strong style={{ fontSize: 14, whiteSpace: 'nowrap' }}>
              RJMA Admin
            </Text>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          transition: 'margin-left 0.2s',
        }}
      >
        <Header
          style={{
            background: designToken.colorBgContainer,
            borderBottom: `1px solid ${designToken.colorBorderSecondary}`,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 56,
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <div
            style={{ cursor: 'pointer', color: designToken.colorTextSecondary }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <MenuUnfoldOutlined style={{ fontSize: 18 }} />
            ) : (
              <MenuFoldOutlined style={{ fontSize: 18 }} />
            )}
          </div>

          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar
                size={32}
                style={{ background: designToken.colorPrimary }}
                icon={<UserOutlined />}
              />
              <Text style={{ fontSize: 13 }}>{user?.name ?? 'Admin'}</Text>
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            padding: '24px',
            minHeight: 'calc(100vh - 56px)',
            background: '#f5f5f5',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
