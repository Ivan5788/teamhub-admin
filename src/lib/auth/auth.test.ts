import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createDemoSession,
  DEMO_PASSWORD,
  demoUserOf,
  getSession,
  hasPermission,
  login,
  setSession,
} from '.'

describe('hasPermission（RBAC）', () => {
  it.each([
    ['admin', 'employees:delete', true],
    ['editor', 'employees:update', true],
    ['editor', 'events:create', true],
    ['editor', 'employees:delete', false],
    ['viewer', 'events:read', true],
    ['viewer', 'events:update', false],
  ] as const)('%s → %s = %s', (role, permission, expected) => {
    expect(hasPermission(role, permission)).toBe(expected)
  })

  it('未登入時沒有任何權限', () => {
    expect(hasPermission(undefined, 'employees:read')).toBe(false)
  })
})

// API 層的 401 / 403 檢查見 src/lib/api/mock/handlers.test.ts
describe('登入狀態', () => {
  afterEach(() => vi.useRealTimers())

  it('過期的登入狀態視為未登入', () => {
    setSession(createDemoSession(demoUserOf('admin')))
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 9 * 3600_000)
    expect(getSession()).toBeNull()
  })

  it('帳號密碼正確時回傳登入狀態，錯誤時拋出訊息', async () => {
    const session = await login('Viewer@TeamHub.dev ', DEMO_PASSWORD)
    expect(session.user.role).toBe('viewer')
    await expect(login('viewer@teamhub.dev', 'wrong')).rejects.toThrow('帳號或密碼錯誤')
  })
})
