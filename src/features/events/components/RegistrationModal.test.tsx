import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { loginAs } from '@/test/auth'
import { eventSeed } from '../mock-data'
import { RegistrationModal } from './RegistrationModal'

const reactEvent = eventSeed.find((e) => e.id === 'evt-2')! // 已上架，6 / 50
const fullEvent = eventSeed.find((e) => e.id === 'evt-3')! // 已額滿，5 / 5

function renderModal(event = reactEvent) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <RegistrationModal event={event} onClose={() => {}} />
    </QueryClientProvider>,
  )
}

describe('RegistrationModal', () => {
  it('選擇員工加入報名後，名單與人數立即更新', async () => {
    const user = userEvent.setup()
    renderModal()
    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText('6 / 50 人')).toBeInTheDocument()

    const select = within(dialog).getByRole('combobox', { name: '選擇要報名的員工' })
    // 已報名的員工不會出現在選項裡
    expect(within(select).queryByRole('option', { name: /王小明/ })).not.toBeInTheDocument()
    await within(select).findByRole('option', { name: /黃淑芬/ })
    await user.selectOptions(select, within(select).getByRole('option', { name: /黃淑芬/ }))
    await user.click(within(dialog).getByRole('button', { name: '加入報名' }))

    expect(await within(dialog).findByText('7 / 50 人')).toBeInTheDocument()
    expect(within(dialog).getByText('黃淑芬')).toBeInTheDocument()
  })

  it('額滿時顯示原因，不提供報名操作', async () => {
    renderModal(fullEvent)
    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText('名額已滿，目前無法新增報名。')).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: '加入報名' })).not.toBeInTheDocument()
  })

  it('檢視者只能看名單，不能報名或取消', async () => {
    loginAs('viewer')
    renderModal()
    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText('王小明')).toBeInTheDocument()
    expect(within(dialog).queryByRole('combobox')).not.toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: /取消.*報名/ })).not.toBeInTheDocument()
  })
})
