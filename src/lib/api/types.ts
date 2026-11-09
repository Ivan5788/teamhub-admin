/**
 * 所有後端資源共用的型別。
 * 新增模組時，實體型別請 extends BaseEntity，API 物件請符合 ResourceApi。
 */

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface ListParams {
  page: number
  pageSize: number
  /** 關鍵字搜尋，由後端（或 mock）決定比對哪些欄位 */
  keyword?: string
  /** 精確比對的篩選條件，例如 { status: 'published' }；空字串視為不篩選 */
  filters?: Record<string, string | undefined>
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** 建立 / 更新時送出的資料：去掉由系統產生的欄位 */
export type EntityInput<T extends BaseEntity> = Omit<T, keyof BaseEntity>

/** 每個資源都要提供的 CRUD 介面。mock 與真實 API 都實作這個介面，頁面不用在意資料從哪來 */
export interface ResourceApi<T extends BaseEntity> {
  list(params: ListParams): Promise<Paginated<T>>
  get(id: string): Promise<T>
  create(input: EntityInput<T>): Promise<T>
  update(id: string, input: Partial<EntityInput<T>>): Promise<T>
  remove(id: string): Promise<void>
}
