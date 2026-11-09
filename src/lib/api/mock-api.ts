import type { BaseEntity, ListParams, Paginated, ResourceApi } from './types'

interface MockOptions<T extends BaseEntity> {
  /** localStorage 的 key，每個資源要不同 */
  storageKey: string
  /** 第一次載入（localStorage 沒資料）時的預設資料 */
  seed: T[]
  /** 關鍵字搜尋會比對的欄位 */
  searchFields: (keyof T)[]
  /** 模擬網路延遲（毫秒） */
  latency?: number
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * 以 localStorage 模擬後端，讓前端在沒有 API 時也能完整開發。
 * 行為刻意貼近真實後端：非同步、會丟錯、回傳分頁格式。
 */
export function createMockApi<T extends BaseEntity>({
  storageKey,
  seed,
  searchFields,
  latency = 300,
}: MockOptions<T>): ResourceApi<T> {
  const key = `mock:${storageKey}`

  const read = (): T[] => {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed))
      return [...seed]
    }
    return JSON.parse(raw) as T[]
  }
  const write = (rows: T[]) => localStorage.setItem(key, JSON.stringify(rows))

  const findIndexOrThrow = (rows: T[], id: string) => {
    const index = rows.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('找不到資料，可能已被刪除')
    return index
  }

  return {
    async list({ page, pageSize, keyword, filters }: ListParams): Promise<Paginated<T>> {
      await sleep(latency)
      let rows = read()

      if (keyword?.trim()) {
        const kw = keyword.trim().toLowerCase()
        rows = rows.filter((row) =>
          searchFields.some((f) => String(row[f] ?? '').toLowerCase().includes(kw)),
        )
      }
      for (const [field, value] of Object.entries(filters ?? {})) {
        if (value) rows = rows.filter((row) => String(row[field as keyof T]) === value)
      }

      rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      const start = (page - 1) * pageSize
      return { items: rows.slice(start, start + pageSize), total: rows.length, page, pageSize }
    },

    async get(id) {
      await sleep(latency)
      const rows = read()
      return rows[findIndexOrThrow(rows, id)]
    },

    async create(input) {
      await sleep(latency)
      const now = new Date().toISOString()
      const entity = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now } as T
      write([entity, ...read()])
      return entity
    },

    async update(id, input) {
      await sleep(latency)
      const rows = read()
      const index = findIndexOrThrow(rows, id)
      const updated = { ...rows[index], ...input, updatedAt: new Date().toISOString() }
      rows[index] = updated
      write(rows)
      return updated
    },

    async remove(id) {
      await sleep(latency)
      const rows = read()
      rows.splice(findIndexOrThrow(rows, id), 1)
      write(rows)
    },
  }
}
