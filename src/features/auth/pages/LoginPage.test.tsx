import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { RequireAuth } from '@/app/RequireAuth'
import { clearSession } from '@/lib/auth'
import { safeRedirect } from '../schema'
import { LoginPage } from './LoginPage'

function CurrentUrl() {
  const location = useLocation()
  return <p>目前位置：{location.pathname + location.search}</p>
}

function renderApp(url: string) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { element: <RequireAuth />, children: [{ path: '*', element: <CurrentUrl /> }] },
    ],
    { initialEntries: [url] },
  )
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

describe('登入流程', () => {
  beforeEach(() => clearSession())

  it('未登入時導向登入頁，登入後回到原本的網址', async () => {
    const user = userEvent.setup()
    const router = renderApp('/events?status=published')

    expect(router.state.location.pathname).toBe('/login')
    await user.click(await screen.findByRole('button', { name: '以檢視者身分登入' }))

    expect(await screen.findByText('目前位置：/events?status=published')).toBeInTheDocument()
  })

  it('帳號密碼錯誤時顯示錯誤訊息', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.type(screen.getByLabelText('Email'), 'admin@teamhub.dev')
    await user.type(screen.getByLabelText('密碼'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: '登入' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('帳號或密碼錯誤')
  })
})

describe('safeRedirect', () => {
  it.each([
    ['/employees?page=2', '/employees?page=2'],
    ['https://evil.example', '/'],
    ['//evil.example', '/'],
    ['/\\evil.example', '/'],
    [null, '/'],
  ])('%s → %s', (input, expected) => {
    expect(safeRedirect(input)).toBe(expected)
  })
})
