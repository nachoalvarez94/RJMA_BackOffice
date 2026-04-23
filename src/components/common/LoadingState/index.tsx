import { Spin } from 'antd'

interface LoadingStateProps {
  tip?: string
}

export function LoadingState({ tip = 'Cargando...' }: LoadingStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 0',
      }}
    >
      <Spin tip={tip} size="large" />
    </div>
  )
}
