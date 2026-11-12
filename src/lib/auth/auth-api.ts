import { http } from '@/lib/api/http'
import { createDemoToken, DEMO_USERS } from './demo-users'
import type { Role } from './permissions'
import type { Session, User } from './session'

const SESSION_HOURS = 8

export { DEMO_PASSWORD, DEMO_USERS } from './demo-users'

export const demoUserOf = (role: Role) => DEMO_USERS.find((u) => u.role === role)!

/** 建立示範用的登入狀態（模擬伺服器的登入回應與測試共用） */
export function createDemoSession(user: User): Session {
  return {
    token: createDemoToken(user),
    user,
    expiresAt: new Date(Date.now() + SESSION_HOURS * 3600_000).toISOString(),
  }
}

/**
 * 登入：POST /auth/login，回傳 { token, user, expiresAt }。
 * Demo 模式由 MSW 模擬伺服器處理，前端程式碼與串接真實後端時完全相同。
 */
export function login(email: string, password: string): Promise<Session> {
  return http<Session>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}
