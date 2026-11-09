import { describe, expect, it } from 'vitest'
import { eventFormSchema } from './schema'

const valid = {
  title: '尾牙',
  category: 'party',
  description: '',
  location: '台北',
  startAt: '2026-12-01T18:00',
  endAt: '2026-12-01T22:00',
  capacity: 100,
  coverUrl: '',
  status: 'draft',
}

const errorPaths = (input: object) => {
  const result = eventFormSchema.safeParse(input)
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.'))
}

describe('eventFormSchema', () => {
  it('接受合法資料，封面網址可留空', () => {
    expect(errorPaths(valid)).toEqual([])
  })

  it('結束時間不可早於或等於開始時間，錯誤標在 endAt', () => {
    expect(errorPaths({ ...valid, endAt: '2026-12-01T17:00' })).toEqual(['endAt'])
    expect(errorPaths({ ...valid, endAt: valid.startAt })).toEqual(['endAt'])
  })

  it('封面網址有填時必須是合法 URL', () => {
    expect(errorPaths({ ...valid, coverUrl: 'not-a-url' })).toEqual(['coverUrl'])
    expect(errorPaths({ ...valid, coverUrl: 'https://example.com/a.png' })).toEqual([])
  })

  it('人數需為正整數', () => {
    expect(errorPaths({ ...valid, capacity: 0 })).toEqual(['capacity'])
    expect(errorPaths({ ...valid, capacity: 1.5 })).toEqual(['capacity'])
  })
})
