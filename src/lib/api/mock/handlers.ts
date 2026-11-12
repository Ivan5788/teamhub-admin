import { delay, http, HttpResponse } from 'msw'
import { createDemoSession } from '@/lib/auth/auth-api'
import { DEMO_PASSWORD, DEMO_USERS, userFromDemoToken } from '@/lib/auth/demo-users'
import { hasPermission, ROLE, type Action } from '@/lib/auth/permissions'
import { API_BASE_URL } from '../config'
import type { BaseEntity, Paginated } from '../types'
import { db, getMockResource, MockHttpError } from './db'

/**
 * MSW 模擬伺服器：在網路層攔截 fetch，行為刻意貼近真實後端。
 * - RESTful CRUD：GET/POST /:resource、GET/PATCH/DELETE /:resource/:id
 * - 驗證 Authorization header，未登入 401、權限不足 403
 * - 模擬網路延遲與隨機伺服器錯誤，方便檢查 loading 與錯誤處理
 *
 * 調整模擬行為（在瀏覽器 DevTools Console 執行後重新整理）：
 *   localStorage.setItem('mock:latency', '2000')   每個請求延遲 2 秒
 *   localStorage.setItem('mock:errorRate', '0.3')  30% 的請求回傳 500
 */

const DEFAULT_LATENCY = import.meta.env.MODE === 'test' ? 0 : 300
const setting = (key: string, fallback: number) => {
  const value = Number(localStorage.getItem(key))
  return Number.isFinite(value) && localStorage.getItem(key) !== null ? value : fallback
}

const error = (status: number, message: string) => HttpResponse.json({ message }, { status })

/** 統一處理延遲、隨機錯誤，並把 MockHttpError 轉成對應的 HTTP 回應 */
async function respond(run: () => Response | Promise<Response>) {
  await delay(setting('mock:latency', DEFAULT_LATENCY))
  if (Math.random() < setting('mock:errorRate', 0))
    return error(500, '伺服器暫時無法回應，請稍後再試')
  try {
    return await run()
  } catch (err) {
    if (err instanceof MockHttpError) return error(err.status, err.message)
    throw err
  }
}

function authorize(request: Request, resource: string, action: Action) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '')
  const user = userFromDemoToken(token)
  if (!user) throw new MockHttpError(401, '登入已過期，請重新登入')
  if (!hasPermission(user.role, `${resource}:${action}`)) {
    throw new MockHttpError(403, `權限不足：${ROLE.label(user.role)}無法執行這個操作`)
  }
}

function resourceOf(name: string) {
  const resource = getMockResource(name)
  if (!resource) throw new MockHttpError(404, `找不到資源 ${name}`)
  const table = db.table(name)
  const output = (row: BaseEntity) => resource.decorate?.(row, db) ?? row
  const indexOf = (rows: BaseEntity[], id: string) => {
    const index = rows.findIndex((r) => r.id === id)
    if (index === -1) throw new MockHttpError(404, '找不到資料，可能已被刪除')
    return index
  }
  return { resource, table, output, indexOf }
}

const RESERVED = new Set(['page', 'pageSize', 'keyword'])
const path = (p: string) => `${API_BASE_URL}${p}`

export const handlers = [
  http.post(path('/auth/login'), ({ request }) =>
    respond(async () => {
      const { email, password } = (await request.json()) as { email?: string; password?: string }
      const user = DEMO_USERS.find((u) => u.email === email?.trim().toLowerCase())
      if (!user || password !== DEMO_PASSWORD) throw new MockHttpError(401, '帳號或密碼錯誤')
      return HttpResponse.json(createDemoSession(user))
    }),
  ),

  http.get(path('/:resource'), ({ request, params }) =>
    respond(() => {
      const name = String(params.resource)
      const { resource, table, output } = resourceOf(name)
      authorize(request, name, 'read')

      const query = new URL(request.url).searchParams
      const page = Math.max(1, Number(query.get('page')) || 1)
      const pageSize = Math.max(1, Number(query.get('pageSize')) || 10)
      const keyword = query.get('keyword')?.trim().toLowerCase()
      let rows = table.all()

      if (keyword) {
        rows = rows.filter((row) =>
          resource.searchFields.some((f) =>
            String(row[f as keyof BaseEntity] ?? '')
              .toLowerCase()
              .includes(keyword),
          ),
        )
      }
      // 其餘查詢參數視為精確比對的篩選條件，例如 ?status=published
      for (const [field, value] of query) {
        if (!RESERVED.has(field) && value) {
          rows = rows.filter((row) => String(row[field as keyof BaseEntity]) === value)
        }
      }

      rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      const start = (page - 1) * pageSize
      const body: Paginated<BaseEntity> = {
        items: rows.slice(start, start + pageSize).map(output),
        total: rows.length,
        page,
        pageSize,
      }
      return HttpResponse.json(body)
    }),
  ),

  http.get(path('/:resource/:id'), ({ request, params }) =>
    respond(() => {
      const name = String(params.resource)
      const { table, output, indexOf } = resourceOf(name)
      authorize(request, name, 'read')
      const rows = table.all()
      return HttpResponse.json(output(rows[indexOf(rows, String(params.id))]))
    }),
  ),

  http.post(path('/:resource'), ({ request, params }) =>
    respond(async () => {
      const name = String(params.resource)
      const { resource, table, output } = resourceOf(name)
      authorize(request, name, 'create')
      const input = (await request.json()) as Partial<BaseEntity>
      resource.beforeCreate?.(input, db)

      const now = new Date().toISOString()
      const entity = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
      table.save([entity as BaseEntity, ...table.all()])
      return HttpResponse.json(output(entity as BaseEntity), { status: 201 })
    }),
  ),

  http.patch(path('/:resource/:id'), ({ request, params }) =>
    respond(async () => {
      const name = String(params.resource)
      const { table, output, indexOf } = resourceOf(name)
      authorize(request, name, 'update')
      const input = (await request.json()) as Partial<BaseEntity>
      const rows = table.all()
      const index = indexOf(rows, String(params.id))
      const { id: _id, createdAt: _createdAt, ...changes } = input
      rows[index] = { ...rows[index], ...changes, updatedAt: new Date().toISOString() }
      table.save(rows)
      return HttpResponse.json(output(rows[index]))
    }),
  ),

  http.delete(path('/:resource/:id'), ({ request, params }) =>
    respond(() => {
      const name = String(params.resource)
      const { table, indexOf } = resourceOf(name)
      authorize(request, name, 'delete')
      const rows = table.all()
      rows.splice(indexOf(rows, String(params.id)), 1)
      table.save(rows)
      return new HttpResponse(null, { status: 204 })
    }),
  ),
]
