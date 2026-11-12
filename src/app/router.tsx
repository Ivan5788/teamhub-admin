import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { NotFoundPage } from './NotFoundPage'
import { PageLoader } from './PageLoader'
import { RequireAuth } from './RequireAuth'
import { RouteErrorPage } from './RouteErrorPage'

/**
 * 頁面一律用 lazy 載入，進到該頁才下載程式碼，首頁載入更快。
 * HydrateFallback：第一次開啟 / 重新整理時，程式碼下載完成前顯示的畫面（沒給 React Router 會警告）。
 * errorElement 放在頁面層，單一頁面出錯時側邊欄仍可使用。
 */
const lazyPage = (load: () => Promise<ComponentType>) => ({
  lazy: async () => ({ Component: await load() }),
  HydrateFallback: PageLoader,
  errorElement: <RouteErrorPage />,
})

/**
 * 新增頁面：在 AdminLayout 的 children 加一筆，並到 config/navigation.ts 加選單。
 * RequireAuth 底下的頁面都需要登入，未登入會導向 /login 並記住原本的網址。
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    ...lazyPage(() => import('@/features/auth').then((m) => m.LoginPage)),
  },
  {
    element: <RequireAuth />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '/',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            ...lazyPage(() => import('@/features/dashboard').then((m) => m.DashboardPage)),
          },
          {
            path: 'employees',
            ...lazyPage(() => import('@/features/employees').then((m) => m.EmployeeListPage)),
          },
          {
            path: 'events',
            ...lazyPage(() => import('@/features/events').then((m) => m.EventListPage)),
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
