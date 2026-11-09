import { createHttpApi } from './http-api'
import { createMockApi } from './mock-api'
import type { BaseEntity, ResourceApi } from './types'

/** .env 設定 VITE_USE_MOCK=false 即切換為真實後端 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

interface Options<T extends BaseEntity> {
  /** REST 路徑名稱，同時作為 mock 的 storage key，例如 'employees' */
  resource: string
  mock: { seed: T[]; searchFields: (keyof T)[] }
}

/** 每個 feature 的 api.ts 只需要呼叫這個函式 */
export function createResourceApi<T extends BaseEntity>({
  resource,
  mock,
}: Options<T>): ResourceApi<T> {
  return USE_MOCK
    ? createMockApi<T>({ storageKey: resource, ...mock })
    : createHttpApi<T>(resource)
}
