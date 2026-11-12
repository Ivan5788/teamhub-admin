import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { loginAs } from '@/test/auth'
import { employeeApi } from '../api'
import { employeeSeed } from '../mock-data'
import { EmployeeListPage } from './EmployeeListPage'

/** mock API 有 300ms 延遲，連續兩次請求需要多一點等待時間 */
const SLOW = { timeout: 3000 }

function renderPage(url = '/') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter([{ path: '/', element: <EmployeeListPage /> }], {
    initialEntries: [url],
  })
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

function seedEmployees(count: number) {
  const rows = Array.from({ length: count }, (_, i) => ({
    ...employeeSeed[0],
    id: `e${i}`,
    name: `員工${i}`,
    createdAt: new Date(2026, 0, count - i).toISOString(),
  }))
  localStorage.setItem('mock:employees', JSON.stringify(rows))
}

describe('EmployeeListPage', () => {
  it('API 失敗時顯示錯誤，按重新載入後恢復', async () => {
    const user = userEvent.setup()
    seedEmployees(1)
    const list = vi.spyOn(employeeApi, 'list').mockRejectedValueOnce(new Error('500'))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('資料載入失敗')
    expect(screen.queryByText('找不到符合條件的員工')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '重新載入' }))

    expect(await screen.findByText('員工0', {}, SLOW)).toBeInTheDocument()
    expect(list).toHaveBeenCalledTimes(2)
  })

  it('刪掉最後一頁的唯一一筆後，自動退回前一頁', async () => {
    const user = userEvent.setup()
    seedEmployees(11)
    const router = renderPage('/?page=2')

    await user.click(await screen.findByRole('button', { name: '刪除' }, SLOW))
    const dialog = await screen.findByRole('dialog', { name: '刪除員工' })
    await user.click(within(dialog).getByRole('button', { name: '確定刪除' }))

    expect(await screen.findByText('第 1–10 筆，共 10 筆', {}, SLOW)).toBeInTheDocument()
    expect(await screen.findByText('員工0', {}, SLOW)).toBeInTheDocument()
    expect(router.state.location.search).toBe('')
  })
})

describe('EmployeeListPage 角色權限', () => {
  it('檢視者看不到新增、編輯、刪除', async () => {
    loginAs('viewer')
    seedEmployees(1)
    renderPage()

    expect(await screen.findByText('員工0', {}, SLOW)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '新增員工' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '編輯' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '刪除' })).not.toBeInTheDocument()
  })

  it('編輯者可以新增與編輯，但不能刪除', async () => {
    loginAs('editor')
    seedEmployees(1)
    renderPage()

    expect(await screen.findByText('員工0', {}, SLOW)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '新增員工' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '編輯' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '刪除' })).not.toBeInTheDocument()
  })
})
