import { setupWorker } from 'msw/browser'
import { API_BASE_URL } from '../config'
import { handlers } from './handlers'

/**
 * 瀏覽器端的模擬伺服器（Service Worker）。只在 Demo 模式由 main.tsx 動態載入。
 * 註冊的是 public/mock-sw.js：它包住 MSW 的 worker，只攔截 API 請求，
 * 頁面導覽與靜態檔案不經過 Service Worker，避免轉送失敗時整個頁面打不開。
 */
export async function startMockServer() {
  await setupWorker(...handlers).start({
    serviceWorker: { url: `/mock-sw.js?api=${encodeURIComponent(API_BASE_URL)}` },
    onUnhandledFrame: 'bypass',
    quiet: true,
  })
}
