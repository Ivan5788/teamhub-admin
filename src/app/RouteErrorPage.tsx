import { Link, useRouteError } from 'react-router'
import { Button } from '@/components/ui'

/** 重新部署後舊的 chunk 檔名會失效，各瀏覽器的錯誤訊息不同 */
const isChunkLoadError = (error: unknown) =>
  error instanceof TypeError &&
  /dynamically imported module|importing a module script failed/i.test(error.message)

/** 頁面崩潰或 lazy 載入失敗時顯示，避免使用者看到 React Router 預設的錯誤畫面 */
export function RouteErrorPage() {
  const error = useRouteError()
  const message = isChunkLoadError(error)
    ? '網站可能已更新，請重新整理後再試一次'
    : '發生非預期的錯誤，請重新整理或稍後再試'

  return (
    <div role="alert" className="py-24 text-center">
      <p className="text-xl font-semibold text-slate-900">頁面無法顯示</p>
      <p className="mt-3 text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button onClick={() => window.location.reload()}>重新整理</Button>
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:underline">
          回到總覽
        </Link>
      </div>
    </div>
  )
}
