import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import esES from 'antd/locale/es_ES'
import { AuthProvider } from '@/store/auth/AuthContext'
import { router } from '@/router'

const theme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Layout: {
      siderBg: '#ffffff',
      headerBg: '#ffffff',
    },
    Menu: {
      itemBorderRadius: 6,
    },
  },
}

export default function App() {
  return (
    <ConfigProvider locale={esES} theme={theme}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ConfigProvider>
  )
}
