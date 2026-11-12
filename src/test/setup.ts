import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { createDemoSession, demoUserOf, setSession } from '@/lib/auth'

beforeEach(() => {
  // mock API 把資料存在 localStorage，每個測試都從乾淨狀態開始
  localStorage.clear()
  // 預設以管理員登入；要測其他角色或未登入時，在測試裡呼叫 loginAs() 或 clearSession()
  setSession(createDemoSession(demoUserOf('admin')))
})
afterEach(cleanup)
