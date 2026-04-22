import { Empty, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

interface EmptyStateProps {
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  description = 'No hay datos disponibles',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Empty
      description={description}
      style={{ padding: '48px 0' }}
    >
      {actionLabel && onAction && (
        <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Empty>
  )
}
