import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { mockServer } from '@/lib/api/mock/server'
import { createDemoSession, demoUserOf, setSession } from '@/lib/auth'

// 與瀏覽器 Demo 相同的 MSW handlers；沒有對應 handler 的請求直接報錯，避免測試偷偷打到外部
beforeAll(() => mockServer.listen({ onUnhandledFrame: 'error' }))
afterEach(() => mockServer.resetHandlers())
afterAll(() => mockServer.close())

beforeEach(() => {
  // 模擬伺服器把資料存在 localStorage，每個測試都從乾淨狀態開始
  localStorage.clear()
  // 預設以管理員登入；要測其他角色或未登入時，在測試裡呼叫 loginAs() 或 clearSession()
  setSession(createDemoSession(demoUserOf('admin')))
})
afterEach(cleanup)
