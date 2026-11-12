import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMockApi } from '@/lib/api/mock-api'
import type { BaseEntity } from '@/lib/api'
import { loginAs } from '@/test/auth'
import {
  clearSession,
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

describe('API 層權限檢查（模擬後端）', () => {
  interface Row extends BaseEntity {
    name: string
  }
  const api = createMockApi<Row>({
    storageKey: 'employees',
    seed: [{ id: '1', name: 'A', createdAt: '', updatedAt: '' }],
    searchFields: ['name'],
    latency: 0,
  })

  it('檢視者可以讀取，但無法新增', async () => {
    loginAs('viewer')
    await expect(api.list({ page: 1, pageSize: 10 })).resolves.toMatchObject({ total: 1 })
    await expect(api.create({ name: 'B' })).rejects.toMatchObject({
      status: 403,
      message: '權限不足：檢視者無法執行這個操作',
    })
  })

  it('編輯者可以修改，但無法刪除', async () => {
    loginAs('editor')
    await expect(api.update('1', { name: 'A2' })).resolves.toMatchObject({ name: 'A2' })
    await expect(api.remove('1')).rejects.toMatchObject({ status: 403 })
  })

  it('未登入時回傳 401', async () => {
    clearSession()
    await expect(api.list({ page: 1, pageSize: 10 })).rejects.toMatchObject({ status: 401 })
  })
})
