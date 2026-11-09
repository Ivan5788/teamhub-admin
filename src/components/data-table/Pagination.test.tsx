import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

const setup = (page: number, total: number | undefined) => {
  const onChange = vi.fn()
  render(<Pagination page={page} pageSize={10} total={total} onChange={onChange} />)
  return onChange
}

describe('Pagination', () => {
  it('頁碼在範圍內時不觸發換頁', () => {
    expect(setup(2, 25)).not.toHaveBeenCalled()
    expect(screen.getByText('第 11–20 筆，共 25 筆')).toBeInTheDocument()
  })

  it('頁碼超出範圍時退回最後一頁，且不顯示矛盾的筆數', () => {
    expect(setup(3, 20)).toHaveBeenCalledWith(2)
    expect(screen.getByText('第 11–20 筆，共 20 筆')).toBeInTheDocument()
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })

  it('全部刪光時回到第 1 頁', () => {
    expect(setup(2, 0)).toHaveBeenCalledWith(1)
  })

  it('資料還沒載入時保留網址上的頁碼', () => {
    expect(setup(3, undefined)).not.toHaveBeenCalled()
  })
})
