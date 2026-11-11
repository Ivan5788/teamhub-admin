import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EmployeeFormModal } from './EmployeeFormModal'

const PHONE_ERROR = '請輸入 09 開頭的 10 碼手機號碼'
const SHAKE = /animate-shake/

function setup() {
  const onClose = vi.fn()
  render(
    <QueryClientProvider client={new QueryClient()}>
      <EmployeeFormModal employee={null} onClose={onClose} />
    </QueryClientProvider>,
  )
  return { onClose, user: userEvent.setup(), dialog: screen.getByRole('dialog') }
}

const phone = () => screen.getByRole('textbox', { name: /手機/ })
const save = () => screen.getByRole('button', { name: '儲存' })

/** jsdom 沒有 animation 樣式屬性，React 會改聽帶前綴的事件，兩種都發才能對應實際瀏覽器 */
const endAnimation = (el: Element) => {
  for (const type of ['animationend', 'webkitAnimationEnd']) {
    fireEvent(el, new Event(type, { bubbles: true }))
  }
}

describe('EmployeeFormModal', () => {
  it('輸入時就顯示與清除驗證錯誤，不需要先按儲存', async () => {
    const { user, dialog } = setup()

    await user.type(phone(), '123')
    expect(await screen.findByText(PHONE_ERROR)).toBeInTheDocument()
    expect(dialog.className).not.toMatch(SHAKE)

    await user.clear(phone())
    await user.type(phone(), '0912345678')
    await waitFor(() => expect(screen.queryByText(PHONE_ERROR)).not.toBeInTheDocument())
  })

  it('儲存時仍有錯誤會震動一次，不會關閉；動畫結束後可再次觸發', async () => {
    const { user, dialog, onClose } = setup()

    await user.click(save())
    await waitFor(() => expect(dialog.className).toMatch(SHAKE))
    expect(onClose).not.toHaveBeenCalled()

    endAnimation(dialog)
    expect(dialog.className).not.toMatch(SHAKE)

    await user.click(save())
    await waitFor(() => expect(dialog.className).toMatch(SHAKE))
  })

  it('沒有變更時可直接取消', async () => {
    const { user, onClose } = setup()
    await user.click(screen.getByRole('button', { name: '取消' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('有未儲存的變更時先確認，可繼續編輯或放棄', async () => {
    const { user, onClose } = setup()
    await user.type(phone(), '09')

    await user.click(screen.getByRole('button', { name: '取消' }))
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('變更尚未儲存')

    await user.click(screen.getByRole('button', { name: '繼續編輯' }))
    expect(phone()).toHaveValue('09')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '放棄變更' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('內容元素的動畫結束不會提早停止震動', async () => {
    const { user, dialog } = setup()

    await user.click(save())
    await waitFor(() => expect(dialog.className).toMatch(SHAKE))

    endAnimation(save())
    expect(dialog.className).toMatch(SHAKE)
  })
})
