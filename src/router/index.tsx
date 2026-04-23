import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { MainLayout } from '@/layouts/MainLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginPage } from '@/pages/Auth/LoginPage'
import { DashboardPage } from '@/pages/Dashboard/DashboardPage'
import { ClientsPage } from '@/pages/Clients/ClientsPage'
import { ProductsPage } from '@/pages/Products/ProductsPage'
import { OrdersPage } from '@/pages/Orders/OrdersPage'
import { InvoicesPage } from '@/pages/Invoices/InvoicesPage'
import { UsersPage } from '@/pages/Users/UsersPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/clientes', element: <ClientsPage /> },
          { path: '/productos', element: <ProductsPage /> },
          { path: '/pedidos', element: <OrdersPage /> },
          { path: '/facturas', element: <InvoicesPage /> },
          { path: '/usuarios', element: <UsersPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
