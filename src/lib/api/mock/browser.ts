import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/** 瀏覽器端的模擬伺服器（Service Worker）。只在 Demo 模式由 main.tsx 動態載入，不會打包進正式 API 模式 */
export async function startMockServer() {
  await setupWorker(...handlers).start({
    // 圖片、字型等其他請求照常送出
    onUnhandledFrame: 'bypass',
    quiet: true,
  })
}
