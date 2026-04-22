import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: '#f0f2f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}

export function AuthLayout() {
  return (
    <Layout style={styles.root}>
      <Outlet />
    </Layout>
  )
}
