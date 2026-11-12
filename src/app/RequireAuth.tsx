import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '@/lib/auth'

/**
 * 路由守衛：未登入（或登入過期、其他分頁登出）時導向登入頁，
 * 並記住原本要去的網址，登入後帶回來。
 */
export function RequireAuth() {
  const session = useSession()
  const location = useLocation()

  if (!session) {
    const redirect = location.pathname + location.search
    const to = redirect === '/' ? '/login' : `/login?redirect=${encodeURIComponent(redirect)}`
    return <Navigate to={to} replace />
  }
  return <Outlet />
}
