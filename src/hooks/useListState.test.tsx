import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { useListState } from './useListState'

const setup = (url: string) =>
  renderHook(() => useListState({ filterKeys: ['status'] }), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
    ),
  })

describe('useListState', () => {
  it('從網址還原分頁、關鍵字與篩選', () => {
    const { result } = setup('/?page=3&q=王&status=active')
    expect(result.current.page).toBe(3)
    expect(result.current.keyword).toBe('王')
    expect(result.current.filters.status).toBe('active')
  })

  it.each(['abc', '0', '-2'])('不合法的頁碼 %s 視為第 1 頁', (page) => {
    expect(setup(`/?page=${page}`).result.current.page).toBe(1)
  })

  it('改篩選或關鍵字時回到第 1 頁', () => {
    const { result } = setup('/?page=3')
    act(() => result.current.setFilter('status', 'active'))
    expect(result.current.page).toBe(1)
    expect(result.current.filters.status).toBe('active')

    act(() => result.current.setPage(2))
    expect(result.current.page).toBe(2)
    act(() => result.current.setKeyword('王'))
    expect(result.current.page).toBe(1)
  })

  it('換頁時保留其他條件', () => {
    const { result } = setup('/?status=active')
    act(() => result.current.setPage(2))
    expect(result.current.page).toBe(2)
    expect(result.current.filters.status).toBe('active')
  })
})
