import { describe, expect, it } from 'vitest'
import { clearSession } from '@/lib/auth'
import { loginAs } from '@/test/auth'
import { createResourceApi } from '../create-resource-api'
import type { BaseEntity } from '../types'
import { MockHttpError } from './db'

interface Row extends BaseEntity {
  name: string
  status: string
}

const row = (n: number, name: string, status = 'active'): Row => ({
  id: `r${n}`,
  name,
  status,
  // n 越大越新
  createdAt: new Date(2026, 0, n).toISOString(),
  updatedAt: new Date(2026, 0, n).toISOString(),
})

// 透過真正的 HTTP 請求測試模擬伺服器（MSW 在網路層攔截）
const api = createResourceApi<Row>({
  resource: 'employees',
  mock: {
    seed: [row(1, 'Alice'), row(2, 'Bob', 'inactive'), row(3, 'alan')],
    searchFields: ['name'],
  },
})

describe('模擬伺服器：查詢', () => {
  it('依建立時間新到舊排序並分頁', async () => {
    const result = await api.list({ page: 2, pageSize: 2 })
    expect(result.items.map((r) => r.id)).toEqual(['r1'])
    expect(result.total).toBe(3)
  })

  it('關鍵字不分大小寫，total 反映篩選後筆數', async () => {
    const result = await api.list({ page: 1, pageSize: 10, keyword: ' AL ' })
    expect(result.items.map((r) => r.name)).toEqual(['alan', 'Alice'])
    expect(result.total).toBe(2)
  })

  it('空字串的篩選條件會被忽略', async () => {
    const active = await api.list({ page: 1, pageSize: 10, filters: { status: 'active' } })
    const all = await api.list({ page: 1, pageSize: 10, filters: { status: '' } })
    expect(active.total).toBe(2)
    expect(all.total).toBe(3)
  })
})

describe('模擬伺服器：寫入', () => {
  it('新增、修改、刪除會寫回資料表', async () => {
    const created = await api.create({ name: 'Carol', status: 'active' })
    expect((await api.get(created.id)).name).toBe('Carol')

    await api.update(created.id, { name: 'Caroline' })
    expect((await api.get(created.id)).name).toBe('Caroline')

    await api.remove(created.id)
    await expect(api.get(created.id)).rejects.toMatchObject({
      status: 404,
      message: '找不到資料，可能已被刪除',
    })
  })
})

describe('模擬伺服器：權限（401 / 403）', () => {
  it('檢視者可以讀取，但無法新增', async () => {
    loginAs('viewer')
    await expect(api.list({ page: 1, pageSize: 10 })).resolves.toMatchObject({ total: 3 })
    await expect(api.create({ name: 'B', status: 'active' })).rejects.toMatchObject({
      status: 403,
      message: '權限不足：檢視者無法執行這個操作',
    })
  })

  it('編輯者可以修改，但無法刪除', async () => {
    loginAs('editor')
    await expect(api.update('r1', { name: 'A2' })).resolves.toMatchObject({ name: 'A2' })
    await expect(api.remove('r1')).rejects.toMatchObject({ status: 403 })
  })

  it('未登入時回傳 401', async () => {
    clearSession()
    await expect(api.list({ page: 1, pageSize: 10 })).rejects.toMatchObject({ status: 401 })
  })
})

describe('模擬伺服器：異常情況', () => {
  it('依設定模擬伺服器錯誤', async () => {
    localStorage.setItem('mock:errorRate', '1')
    await expect(api.list({ page: 1, pageSize: 10 })).rejects.toMatchObject({ status: 500 })
  })

  it('商業規則檢查失敗時回傳對應狀態碼', async () => {
    const guarded = createResourceApi<Row>({
      resource: 'guarded',
      mock: {
        seed: [],
        searchFields: [],
        beforeCreate: () => {
          throw new MockHttpError(409, '名額已滿')
        },
      },
    })
    await expect(guarded.create({ name: 'x', status: 'active' })).rejects.toMatchObject({
      status: 409,
      message: '名額已滿',
    })
  })
})
