import { describe, expect, it } from 'vitest'
import { formatDate, formatTime, toDateTimeLocal } from './utils'

describe('日期格式化', () => {
  // 不帶時區的字串以本地時間解析，結果與執行環境的時區無關
  const iso = '2026-03-05T09:07'

  it('formatDate 補零並用斜線分隔', () => {
    expect(formatDate(iso)).toBe('2026/03/05')
    expect(formatDate(iso, true)).toBe('2026/03/05 09:07')
  })

  it('沒有值時顯示 -', () => {
    expect(formatDate(undefined)).toBe('-')
  })

  it('formatTime 為 24 小時制', () => {
    expect(formatTime('2026-03-05T21:30')).toBe('21:30')
  })

  it('toDateTimeLocal 轉成 datetime-local 輸入框格式', () => {
    expect(toDateTimeLocal(iso)).toBe('2026-03-05T09:07')
  })
})
