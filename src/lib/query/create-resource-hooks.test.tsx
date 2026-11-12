import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { BaseEntity, Paginated, ResourceApi } from '@/lib/api'
import { createResourceHooks } from './create-resource-hooks'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

interface Item extends BaseEntity {
  status: 'draft' | 'published'
}

const item: Item = { id: '1', status: 'draft', createdAt: '', updatedAt: '' }
const listKey = ['items', 'list', { page: 1, pageSize: 10 }]

function setup(update: ResourceApi<Item>['update']) {
  const api = { update } as ResourceApi<Item>
  const hooks = createResourceHooks('items', api, '項目')
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  qc.setQueryData<Paginated<Item>>(listKey, { items: [item], total: 1, page: 1, pageSize: 10 })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  const { result } = renderHook(() => hooks.useUpdate({ optimistic: true }), { wrapper })
  const statusInCache = () => qc.getQueryData<Paginated<Item>>(listKey)?.items[0].status
  return { result, statusInCache }
}

describe('useUpdate({ optimistic: true })', () => {
  it('送出後立即更新列表快取，不等 API 回應', async () => {
    let resolve!: (v: Item) => void
    const { result, statusInCache } = setup(() => new Promise((r) => (resolve = r)))

    act(() => result.current.mutate({ id: '1', input: { status: 'published' } }))

    await waitFor(() => expect(statusInCache()).toBe('published'))
    expect(result.current.isPending).toBe(true)
    await act(async () => resolve({ ...item, status: 'published' }))
  })

  it('API 失敗時還原成原本的資料', async () => {
    const { result, statusInCache } = setup(() => Promise.reject(new Error('伺服器錯誤')))

    act(() => result.current.mutate({ id: '1', input: { status: 'published' } }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(statusInCache()).toBe('draft')
  })
})
