import { describe, expect, it } from 'vitest'
import { createMockApi } from './mock-api'
import type { BaseEntity } from './types'

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

const seed = [row(1, 'Alice'), row(2, 'Bob', 'inactive'), row(3, 'alan')]
const makeApi = () =>
  createMockApi<Row>({ storageKey: 'test', seed, searchFields: ['name'], latency: 0 })

describe('createMockApi', () => {
  it('依建立時間新到舊排序並分頁', async () => {
    const result = await makeApi().list({ page: 2, pageSize: 2 })
    expect(result.items.map((r) => r.id)).toEqual(['r1'])
    expect(result.total).toBe(3)
  })

  it('關鍵字不分大小寫，total 反映篩選後筆數', async () => {
    const result = await makeApi().list({ page: 1, pageSize: 10, keyword: ' AL ' })
    expect(result.items.map((r) => r.name)).toEqual(['alan', 'Alice'])
    expect(result.total).toBe(2)
  })

  it('空字串的篩選條件會被忽略', async () => {
    const api = makeApi()
    const active = await api.list({ page: 1, pageSize: 10, filters: { status: 'active' } })
    const all = await api.list({ page: 1, pageSize: 10, filters: { status: '' } })
    expect(active.total).toBe(2)
    expect(all.total).toBe(3)
  })

  it('新增、修改、刪除會寫回儲存空間', async () => {
    const api = makeApi()
    const created = await api.create({ name: 'Carol', status: 'active' })
    expect((await api.get(created.id)).name).toBe('Carol')

    await api.update(created.id, { name: 'Caroline' })
    expect((await makeApi().get(created.id)).name).toBe('Caroline')

    await api.remove(created.id)
    await expect(api.get(created.id)).rejects.toThrow('找不到資料')
  })
})
