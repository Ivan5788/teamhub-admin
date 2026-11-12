/* eslint-disable */
/**
 * MSW Service Worker 的外層。只讓 MSW 處理 API 請求，
 * 頁面導覽、JS、CSS、圖片等一律不經過 Service Worker，由瀏覽器直接處理。
 *
 * 原因：MSW 預設攔截所有請求再轉送，轉送失敗（短暫斷線、導覽中斷、擴充套件阻擋）
 * 時連頁面本身都會載入失敗。模擬伺服器只需要 /api，其他請求沒有理由經過它。
 *
 * API 路徑前綴由註冊時的 ?api= 參數傳入（見 src/lib/api/mock/browser.ts）。
 * mockServiceWorker.js 由 `npx msw init` 產生，不要手動修改。
 */
const API_PREFIX = new URL(self.location.href).searchParams.get('api') || '/api'

// 這個 listener 先註冊，會比 MSW 的 listener 先執行；
// 不是 API 的請求在這裡停止傳遞，MSW 就不會呼叫 respondWith，瀏覽器照常送出。
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  const isApi = url.origin === self.location.origin && url.pathname.startsWith(API_PREFIX + '/')
  if (!isApi) event.stopImmediatePropagation()
})

importScripts('./mockServiceWorker.js')
