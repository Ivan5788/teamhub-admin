import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { USE_MOCK } from './lib/api/config'
import './index.css'

/** Demo 模式先啟動 MSW 模擬伺服器，確保第一個 API 請求就被攔截 */
async function prepare() {
  if (!USE_MOCK) return
  const { startMockServer } = await import('./lib/api/mock/browser')
  await startMockServer()
}

void prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
