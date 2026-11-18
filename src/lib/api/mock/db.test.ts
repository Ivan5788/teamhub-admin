import { beforeEach, describe, expect, it } from 'vitest'
import { resetIfSeedChanged } from './db'

describe('resetIfSeedChanged', () => {
  beforeEach(() => localStorage.clear())

  it('示範資料改版時清掉舊資料表，但保留模擬伺服器設定與登入狀態', () => {
    localStorage.setItem('mock:employees', '[]')
    localStorage.setItem('mock:latency', '0')
    localStorage.setItem('teamhub:session', '{}')

    resetIfSeedChanged()

    expect(localStorage.getItem('mock:employees')).toBeNull()
    expect(localStorage.getItem('mock:latency')).toBe('0')
    expect(localStorage.getItem('teamhub:session')).toBe('{}')
  })

  it('版本相同時不動使用者的資料', () => {
    resetIfSeedChanged()
    localStorage.setItem('mock:employees', '[]')

    resetIfSeedChanged()

    expect(localStorage.getItem('mock:employees')).toBe('[]')
  })
})
