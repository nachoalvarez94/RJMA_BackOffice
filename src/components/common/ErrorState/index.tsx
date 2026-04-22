import { Result, Button } from 'antd'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  message = 'Se produjo un error al cargar los datos.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Result
      status="error"
      title="Error"
      subTitle={message}
      extra={
        onRetry && (
          <Button type="primary" onClick={onRetry}>
            Reintentar
          </Button>
        )
      }
    />
  )
}
