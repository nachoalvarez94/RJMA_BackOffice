import { Tag } from 'antd'

interface StatusTagProps {
  activo: boolean
  labelActive?: string
  labelInactive?: string
}

export function StatusTag({
  activo,
  labelActive = 'Activo',
  labelInactive = 'Inactivo',
}: StatusTagProps) {
  return (
    <Tag color={activo ? 'success' : 'default'}>
      {activo ? labelActive : labelInactive}
    </Tag>
  )
}
