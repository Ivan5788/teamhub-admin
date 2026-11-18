import { describe, expect, it } from 'vitest'
import { employeeSeed } from './mock-data'
import { employeeFormSchema } from './schema'

describe('員工示範資料', () => {
  it('每一筆都通過表單驗證', () => {
    for (const e of employeeSeed) {
      expect(employeeFormSchema.safeParse(e).success, e.name).toBe(true)
    }
  })

  it('id、Email、手機都不重複', () => {
    for (const key of ['id', 'email', 'phone'] as const) {
      expect(new Set(employeeSeed.map((e) => e[key])).size).toBe(employeeSeed.length)
    }
  })

  it('資料量足以展示分頁，且每種狀態都有樣本', () => {
    expect(employeeSeed.length).toBeGreaterThan(40)
    const statuses = new Set(employeeSeed.map((e) => e.status))
    expect([...statuses].sort()).toEqual(['active', 'onLeave', 'resigned'])
  })
})
