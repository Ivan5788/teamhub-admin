import { describe, expect, it } from 'vitest'
import { loginAs } from '@/test/auth'
import { eventApi, registrationApi } from './api'
import type { CompanyEvent } from './schema'
import { getRegistrationState } from './utils'

const event = (overrides: Partial<CompanyEvent> = {}) =>
  ({
    status: 'published',
    capacity: 2,
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-01T12:00:00.000Z',
    ...overrides,
  }) as CompanyEvent
const before = new Date('2026-05-01T00:00:00.000Z')

describe('getRegistrationState', () => {
  it('已上架、未結束、未額滿時開放報名', () => {
    expect(getRegistrationState(event(), 1, before).key).toBe('open')
  })

  it.each([
    ['未上架', event({ status: 'draft' }), 0, before, 'unpublished'],
    ['已結束', event(), 0, new Date('2026-06-02T00:00:00.000Z'), 'ended'],
    ['額滿', event(), 2, before, 'full'],
  ] as const)('%s時不能報名', (_label, e, count, now, key) => {
    const state = getRegistrationState(e, count, now)
    expect(state.key).toBe(key)
    expect(state.reason).toBeTruthy()
  })
})

// 以下透過 HTTP 呼叫 MSW 模擬伺服器，驗證伺服器端的報名規則
// 種子資料：evt-2 已上架（6/50）、evt-3 已額滿（5/5）、evt-1 草稿；emp-4 留職停薪、emp-7 離職
describe('報名規則（伺服器端）', () => {
  it('報名成功後，活動的報名人數跟著更新', async () => {
    await registrationApi.create({ eventId: 'evt-2', employeeId: 'emp-6' })
    expect((await eventApi.get('evt-2')).registeredCount).toBe(7)
  })

  it.each([
    ['重複報名', 'evt-2', 'emp-1', '已經報名過了'],
    ['名額已滿', 'evt-3', 'emp-2', '名額已滿'],
    ['活動未上架', 'evt-1', 'emp-2', '活動尚未上架，無法報名'],
    ['非在職員工', 'evt-2', 'emp-4', '只有在職員工可以報名'],
  ])('%s時回傳 409', async (_label, eventId, employeeId, message) => {
    await expect(registrationApi.create({ eventId, employeeId })).rejects.toMatchObject({
      status: 409,
      message: expect.stringContaining(message),
    })
  })

  it('人數上限不能改成少於已報名人數', async () => {
    await expect(eventApi.update('evt-2', { capacity: 3 })).rejects.toMatchObject({
      status: 409,
      message: '人數上限不能少於已報名人數（6 人）',
    })
  })

  it('報名名單附上員工摘要', async () => {
    const { items } = await registrationApi.list({
      page: 1,
      pageSize: 50,
      filters: { eventId: 'evt-4' },
    })
    expect(items.map((r) => r.employee?.name).sort()).toHaveLength(2)
    expect(items[0].employee).toMatchObject({
      name: expect.any(String),
      department: expect.any(String),
    })
  })

  it('編輯者可以報名，但不能取消報名', async () => {
    loginAs('editor')
    const created = await registrationApi.create({ eventId: 'evt-2', employeeId: 'emp-6' })
    await expect(registrationApi.remove(created.id)).rejects.toMatchObject({ status: 403 })
  })
})
