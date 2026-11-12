import type { User } from './session'

/** 示範帳號：Demo 網站登入頁提供一鍵登入，密碼相同。模擬伺服器也用這份資料驗證身分 */
export const DEMO_PASSWORD = 'demo1234'
export const DEMO_USERS: User[] = [
  { id: 'u1', name: '林雅婷', email: 'admin@teamhub.dev', role: 'admin' },
  { id: 'u2', name: '陳冠宇', email: 'editor@teamhub.dev', role: 'editor' },
  { id: 'u3', name: '王思妤', email: 'viewer@teamhub.dev', role: 'viewer' },
]

/** 示範 token 格式：demo.<使用者 id>.<隨機字串>，模擬伺服器從中解析出使用者 */
export const createDemoToken = (user: User) => `demo.${user.id}.${crypto.randomUUID()}`

export function userFromDemoToken(token: string | undefined) {
  const [prefix, id] = token?.split('.') ?? []
  return prefix === 'demo' ? DEMO_USERS.find((u) => u.id === id) : undefined
}
