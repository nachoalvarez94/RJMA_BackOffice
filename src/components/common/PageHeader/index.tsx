import { Typography, Space } from 'antd'
import type { ReactNode } from 'react'

const { Title, Text } = Typography

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
      }}
    >
      <Space direction="vertical" size={2}>
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        {subtitle && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {subtitle}
          </Text>
        )}
      </Space>
      {actions && <Space>{actions}</Space>}
    </div>
  )
}
