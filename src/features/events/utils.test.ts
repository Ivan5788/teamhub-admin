import { describe, expect, it } from 'vitest'
import type { CompanyEvent } from './schema'
import { getEventPhase } from './utils'

const event = {
  startAt: '2026-06-01T10:00:00.000Z',
  endAt: '2026-06-01T12:00:00.000Z',
} as CompanyEvent

const phaseAt = (iso: string) => getEventPhase(event, new Date(iso)).key

describe('getEventPhase', () => {
  it('開始前為 upcoming', () => {
    expect(phaseAt('2026-06-01T09:59:59.000Z')).toBe('upcoming')
  })

  it('開始與結束的當下都算 ongoing', () => {
    expect(phaseAt('2026-06-01T10:00:00.000Z')).toBe('ongoing')
    expect(phaseAt('2026-06-01T12:00:00.000Z')).toBe('ongoing')
  })

  it('結束後為 ended', () => {
    expect(phaseAt('2026-06-01T12:00:00.001Z')).toBe('ended')
  })
})
