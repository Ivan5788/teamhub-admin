import { USE_MOCK } from './config'
import { createHttpApi } from './http-api'
import { registerMockResource, type MockResource } from './mock/db'
import type { BaseEntity, ResourceApi } from './types'

interface Options<T extends BaseEntity> {
  /** REST 路徑名稱，同時是權限的資源名稱，例如 'employees' */
  resource: string
  /** Demo 模式下模擬伺服器使用的資料與規則；串接真實後端時不會用到 */
  mock: MockResource<T>
}

/**
 * 每個 feature 的 api.ts 只需要呼叫這個函式。
 * 前端一律透過 HTTP 取資料；Demo 模式由 MSW 在網路層攔截並模擬伺服器回應，
 * 所以切換到真實後端時，前端程式碼完全不用改。
 */
export function createResourceApi<T extends BaseEntity>({
  resource,
  mock,
}: Options<T>): ResourceApi<T> {
  if (USE_MOCK) registerMockResource(resource, mock)
  return createHttpApi<T>(resource)
}
