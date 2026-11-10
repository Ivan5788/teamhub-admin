import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

const close = () => screen.getByRole('button', { name: '關閉' })

describe('Modal', () => {
  it('以標題作為對話框名稱', () => {
    render(
      <Modal open onClose={() => {}} title="編輯員工">
        <input />
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: '編輯員工' })).toBeInTheDocument()
  })

  it('開啟時聚焦內容的第一個欄位', () => {
    render(
      <Modal open onClose={() => {}} title="t">
        <input aria-label="姓名" />
      </Modal>,
    )
    expect(screen.getByLabelText('姓名')).toHaveFocus()
  })

  it('內容沒有欄位時聚焦對話框本身，不聚焦確認按鈕', () => {
    render(
      <Modal open onClose={() => {}} title="t" footer={<button>確定刪除</button>}>
        <p>確定嗎</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toHaveFocus()
  })

  it('Tab 與 Shift+Tab 在對話框內循環', async () => {
    const user = userEvent.setup()
    render(
      <>
        <button>背景按鈕</button>
        <Modal open onClose={() => {}} title="t" footer={<button>儲存</button>}>
          <input aria-label="姓名" />
        </Modal>
      </>,
    )

    await user.tab() // 姓名 → 儲存
    expect(screen.getByRole('button', { name: '儲存' })).toHaveFocus()
    await user.tab() // 儲存 → 繞回第一個（關閉）
    expect(close()).toHaveFocus()
    await user.tab({ shift: true }) // 關閉 → 繞回最後一個（儲存）
    expect(screen.getByRole('button', { name: '儲存' })).toHaveFocus()
  })

  it('父層重新 render 傳入新的 onClose 時，不會搶走輸入中的焦點', async () => {
    const user = userEvent.setup()
    const content = (
      <>
        <input aria-label="第一欄" />
        <input aria-label="第二欄" />
      </>
    )
    const { rerender } = render(
      <Modal open onClose={() => {}} title="t">
        {content}
      </Modal>,
    )

    await user.click(screen.getByLabelText('第二欄'))
    rerender(
      <Modal open onClose={() => {}} title="t">
        {content}
      </Modal>,
    )

    expect(screen.getByLabelText('第二欄')).toHaveFocus()
  })

  it('Esc 呼叫最新的 onClose', async () => {
    const user = userEvent.setup()
    const first = vi.fn()
    const latest = vi.fn()
    const { rerender } = render(
      <Modal open onClose={first} title="t">
        <input />
      </Modal>,
    )
    rerender(
      <Modal open onClose={latest} title="t">
        <input />
      </Modal>,
    )

    await user.keyboard('{Escape}')

    expect(latest).toHaveBeenCalledOnce()
    expect(first).not.toHaveBeenCalled()
  })

  it('關閉後焦點回到開啟它的按鈕', async () => {
    function Page() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>開啟</button>
          <Modal open={open} onClose={() => setOpen(false)} title="t">
            <input />
          </Modal>
        </>
      )
    }
    const user = userEvent.setup()
    render(<Page />)

    await user.click(screen.getByRole('button', { name: '開啟' }))
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '開啟' })).toHaveFocus()
  })
})
