import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { EventFormModal } from './EventFormModal'

const renderForm = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <EventFormModal event={null} onClose={() => {}} />
    </QueryClientProvider>,
  )

describe('EventFormModal', () => {
  it('輸入封面網址時即時顯示預覽', async () => {
    const user = userEvent.setup()
    renderForm()
    const dialog = screen.getByRole('dialog')
    expect(dialog.querySelector('img')).toBeNull()

    await user.type(screen.getByRole('textbox', { name: /封面/ }), 'https://example.com/a.png')

    await waitFor(() =>
      expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/a.png'),
    )
  })

  it('先填結束時間再把開始時間改晚時，結束時間立即顯示錯誤', async () => {
    renderForm()

    fireEvent.change(screen.getByLabelText(/結束時間/), { target: { value: '2026-12-01T10:00' } })
    fireEvent.change(screen.getByLabelText(/開始時間/), { target: { value: '2026-12-01T12:00' } })

    expect(await screen.findByText('結束時間需晚於開始時間')).toBeInTheDocument()
  })

  it('只填開始時間時，不提早要求選擇結束時間', async () => {
    renderForm()

    fireEvent.change(screen.getByLabelText(/開始時間/), { target: { value: '2026-12-01T12:00' } })

    await waitFor(() => expect(screen.getByLabelText(/開始時間/)).toHaveValue('2026-12-01T12:00'))
    expect(screen.queryByText('請選擇結束時間')).not.toBeInTheDocument()
  })
})
