import { test as base, expect } from '@playwright/test'

type Role = 'admin' | 'editor' | 'viewer'

// 與 src/lib/auth/auth-api.ts 的示範帳號一致（那邊用到 import.meta.env，無法直接在 Node 匯入）
const USERS = {
  admin: { id: 'u1', name: '林雅婷', email: 'admin@teamhub.dev', role: 'admin' },
  editor: { id: 'u2', name: '陳冠宇', email: 'editor@teamhub.dev', role: 'editor' },
  viewer: { id: 'u3', name: '王思妤', email: 'viewer@teamhub.dev', role: 'viewer' },
} as const

/**
 * 每個測試預設以管理員登入，直接寫入登入狀態，不必每次都走登入頁。
 *   test.use({ role: 'viewer' })  以其他角色執行
 *   test.use({ role: null })      未登入
 */
export const test = base.extend<{ role: Role | null }>({
  role: ['admin', { option: true }],
  page: async ({ page, role }, provide) => {
    if (role) {
      const session = {
        token: `demo.${USERS[role].id}.e2e`,
        user: USERS[role],
        expiresAt: new Date(Date.now() + 3600_000).toISOString(),
      }
      // 只在分頁第一次載入時寫入，之後的登出、重新整理維持真實行為
      await page.addInitScript((value) => {
        if (sessionStorage.getItem('e2e:seeded')) return
        localStorage.setItem('teamhub:session', value)
        sessionStorage.setItem('e2e:seeded', '1')
      }, JSON.stringify(session))
    }
    await provide(page)
  },
})

export { expect }
