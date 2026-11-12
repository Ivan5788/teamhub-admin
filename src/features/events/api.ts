import { createResourceApi } from '@/lib/api'
import { createResourceHooks } from '@/lib/query/create-resource-hooks'
import { eventSeed } from './mock-data'
import type { CompanyEvent } from './schema'

export const eventApi = createResourceApi<CompanyEvent>({
  resource: 'events',
  mock: { seed: eventSeed, searchFields: ['title', 'location', 'description'] },
})

export const eventHooks = createResourceHooks('events', eventApi, '活動')

/**
 * 模組專屬的 hook 範例：在通用 CRUD 之上包裝業務動作。
 * 採樂觀更新：按下後立刻切換狀態，失敗才還原並提示。
 * 若後端提供專用 API（例如 POST /events/:id/publish），只要改這裡的實作。
 */
export function useTogglePublish() {
  const update = eventHooks.useUpdate({ optimistic: true })
  return {
    ...update,
    toggle: (event: CompanyEvent) => {
      const publishing = event.status !== 'published'
      update.mutate({
        id: event.id,
        input: { status: publishing ? 'published' : 'unpublished' },
        successMessage: publishing ? `「${event.title}」已上架` : `「${event.title}」已下架`,
      })
    },
  }
}
