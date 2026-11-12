import { http, HttpError } from '@/lib/api/http'
import type { Role } from './permissions'
import type { Session, User } from './session'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const SESSION_HOURS = 8

/** 示範帳號：Demo 網站登入頁提供一鍵登入，密碼相同 */
export const DEMO_PASSWORD = 'demo1234'
export const DEMO_USERS: User[] = [
  { id: 'u1', name: '林雅婷', email: 'admin@teamhub.dev', role: 'admin' },
  { id: 'u2', name: '陳冠宇', email: 'editor@teamhub.dev', role: 'editor' },
  { id: 'u3', name: '王思妤', email: 'viewer@teamhub.dev', role: 'viewer' },
]

export const demoUserOf = (role: Role) => DEMO_USERS.find((u) => u.role === role)!

/** 建立示範用的登入狀態（mock 登入與測試共用） */
export function createDemoSession(user: User): Session {
  return {
    token: `demo.${user.id}.${crypto.randomUUID()}`,
    user,
    expiresAt: new Date(Date.now() + SESSION_HOURS * 3600_000).toISOString(),
  }
}

/**
 * 登入。mock 模式比對示範帳號；真實後端呼叫 POST /auth/login，
 * 預期回傳 { token, user, expiresAt }。
 */
export async function login(email: string, password: string): Promise<Session> {
  if (!USE_MOCK) {
    return http<Session>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }
  await new Promise((r) => setTimeout(r, 400))
  const user = DEMO_USERS.find((u) => u.email === email.trim().toLowerCase())
  if (!user || password !== DEMO_PASSWORD) throw new HttpError(401, '帳號或密碼錯誤')
  return createDemoSession(user)
}
