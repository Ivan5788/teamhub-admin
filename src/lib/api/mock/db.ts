import type { BaseEntity } from '../types'

/**
 * 模擬伺服器的資料表，存在 localStorage（key 為 mock:資源名稱）。
 * 只有 MSW 的 handlers 會用到；前端程式碼一律透過 HTTP 取資料。
 */

export class MockHttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export interface MockResource<T extends BaseEntity = BaseEntity> {
  /** 第一次存取（localStorage 沒資料）時的預設資料 */
  seed: T[]
  /** 關鍵字搜尋會比對的欄位 */
  searchFields: (keyof T)[]
  /** 新增前的商業規則檢查（例如名額已滿），不通過時丟出 MockHttpError */
  beforeCreate?: (input: Partial<T>, db: MockDb) => void
  /** 修改前的商業規則檢查（例如人數上限不能少於已報名人數） */
  beforeUpdate?: (current: T, changes: Partial<T>, db: MockDb) => void
  /** 回應前補上計算欄位（例如報名人數），不會寫回資料表 */
  decorate?: (row: T, db: MockDb) => T
}

const registry = new Map<string, MockResource>()

/** 資源在定義 API 時自動註冊（見 createResourceApi），handlers 依資源名稱找到設定 */
export function registerMockResource<T extends BaseEntity>(
  name: string,
  resource: MockResource<T>,
) {
  registry.set(name, resource as unknown as MockResource)
}

export function getMockResource(name: string) {
  return registry.get(name)
}

export interface MockTable<T extends BaseEntity = BaseEntity> {
  all(): T[]
  save(rows: T[]): void
}

export interface MockDb {
  table<T extends BaseEntity = BaseEntity>(name: string): MockTable<T>
}

export const db: MockDb = {
  table<T extends BaseEntity>(name: string): MockTable<T> {
    const key = `mock:${name}`
    return {
      all() {
        const raw = localStorage.getItem(key)
        if (raw) return JSON.parse(raw) as T[]
        const resource = registry.get(name)
        // 資源尚未註冊時不寫入，避免之後註冊的初始資料被空陣列蓋掉
        if (!resource) return []
        localStorage.setItem(key, JSON.stringify(resource.seed))
        return [...(resource.seed as T[])]
      },
      save(rows) {
        localStorage.setItem(key, JSON.stringify(rows))
      },
    }
  },
}
