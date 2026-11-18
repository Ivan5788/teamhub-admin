import { describe, expect, it } from 'vitest'
import { employeeSeed } from '@/features/employees/mock-data'
import { eventSeed, registrationSeed } from './mock-data'

const employees = new Map(employeeSeed.map((e) => [e.id, e]))
const events = new Map(eventSeed.map((e) => [e.id, e]))

describe('活動示範資料', () => {
  it('結束時間都晚於開始時間', () => {
    for (const e of eventSeed) {
      expect(new Date(e.endAt) > new Date(e.startAt), e.title).toBe(true)
    }
  })

  it('報名資料符合伺服器規則：員工與活動存在、在職、不重複、不超過名額', () => {
    const counts = new Map<string, number>()
    const pairs = new Set<string>()

    for (const r of registrationSeed) {
      const event = events.get(r.eventId)
      const employee = employees.get(r.employeeId)
      expect(event, r.id).toBeDefined()
      expect(employee?.status, r.id).toBe('active')
      expect(event?.status, r.id).toBe('published')

      const pair = `${r.eventId}/${r.employeeId}`
      expect(pairs.has(pair), pair).toBe(false)
      pairs.add(pair)
      counts.set(r.eventId, (counts.get(r.eventId) ?? 0) + 1)
    }

    for (const [eventId, count] of counts) {
      expect(count, eventId).toBeLessThanOrEqual(events.get(eventId)!.capacity)
    }
  })

  it('涵蓋額滿、接近額滿與尚有名額的活動', () => {
    const ratio = (id: string) =>
      registrationSeed.filter((r) => r.eventId === id).length / events.get(id)!.capacity
    const ratios = eventSeed.map((e) => ratio(e.id))

    expect(ratios.filter((x) => x === 1).length).toBeGreaterThanOrEqual(2)
    expect(ratios.some((x) => x >= 0.8 && x < 1)).toBe(true)
    expect(ratios.some((x) => x > 0 && x < 0.5)).toBe(true)
  })
})
