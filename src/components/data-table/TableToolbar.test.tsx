import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TableToolbar } from './TableToolbar'

const input = () => screen.getByRole<HTMLInputElement>('searchbox')
const type = (value: string) => fireEvent.change(input(), { target: { value } })
const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms))

describe('TableToolbar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('注音組字時保留輸入內容，選字完成後才搜尋一次', () => {
    const onChange = vi.fn()
    render(<TableToolbar keyword="" onKeywordChange={onChange} />)

    fireEvent.compositionStart(input())
    type('ㄨ')
    expect(input().value).toBe('ㄨ')
    type('ㄨㄤ')
    expect(input().value).toBe('ㄨㄤ')
    type('王')
    wait(1000)
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.compositionEnd(input())
    wait(300)
    expect(input().value).toBe('王')
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith('王')
  })

  it('一般輸入停止後才更新一次', () => {
    const onChange = vi.fn()
    render(<TableToolbar keyword="" onKeywordChange={onChange} />)

    type('a')
    wait(100)
    type('ab')
    wait(299)
    expect(onChange).not.toHaveBeenCalled()
    wait(1)
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith('ab')
  })

  it('計時結束時呼叫最新的 callback', () => {
    const stale = vi.fn()
    const latest = vi.fn()
    const { rerender } = render(<TableToolbar keyword="" onKeywordChange={stale} />)

    type('a')
    rerender(<TableToolbar keyword="" onKeywordChange={latest} />)
    wait(300)

    expect(stale).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledWith('a')
  })

  it('網址的關鍵字被外部清除時同步輸入框，並取消待送出的搜尋', () => {
    const onChange = vi.fn()
    const { rerender } = render(<TableToolbar keyword="王" onKeywordChange={onChange} />)
    expect(input().value).toBe('王')

    type('王小')
    rerender(<TableToolbar keyword="" onKeywordChange={onChange} />)
    wait(300)

    expect(input().value).toBe('')
    expect(onChange).not.toHaveBeenCalled()
  })
})
