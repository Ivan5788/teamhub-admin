import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { EventFormModal } from './EventFormModal'

describe('EventFormModal', () => {
  it('輸入封面網址時即時顯示預覽', async () => {
    const user = userEvent.setup()
    render(
      <QueryClientProvider client={new QueryClient()}>
        <EventFormModal event={null} onClose={() => {}} />
      </QueryClientProvider>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.querySelector('img')).toBeNull()

    await user.type(screen.getByRole('textbox', { name: /封面/ }), 'https://example.com/a.png')

    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://example.com/a.png')
  })
})
