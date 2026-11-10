import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { NotFoundPage } from './NotFoundPage'
import { PageLoader } from './PageLoader'
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

/** 新增頁面：在 children 加一筆，並到 config/navigation.ts 加選單 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    errorElement: <RouteErrorPage />,
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
])
