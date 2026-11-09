import { http } from './http'
import type { BaseEntity, ListParams, Paginated, ResourceApi } from './types'

/**
 * 依 RESTful 慣例產生 CRUD API：
 *   GET    /employees?page=1&pageSize=10&keyword=xx&status=active
 *   GET    /employees/:id
 *   POST   /employees
 *   PATCH  /employees/:id
 *   DELETE /employees/:id
 * 後端格式若不同，只需要改這個檔案。
 */
export function createHttpApi<T extends BaseEntity>(resource: string): ResourceApi<T> {
  return {
    list({ page, pageSize, keyword, filters }: ListParams) {
      const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (keyword) query.set('keyword', keyword)
      for (const [k, v] of Object.entries(filters ?? {})) if (v) query.set(k, v)
      return http<Paginated<T>>(`/${resource}?${query}`)
    },
    get: (id) => http<T>(`/${resource}/${id}`),
    create: (input) => http<T>(`/${resource}`, { method: 'POST', body: JSON.stringify(input) }),
    update: (id, input) =>
      http<T>(`/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    remove: (id) => http<void>(`/${resource}/${id}`, { method: 'DELETE' }),
  }
}
