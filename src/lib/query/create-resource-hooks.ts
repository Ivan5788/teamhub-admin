import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import type { BaseEntity, EntityInput, ListParams, Paginated, ResourceApi } from '@/lib/api'

interface HookOptions {
  /** 這個資源異動後，也要一起刷新的其他資源（例如新增報名後，活動列表的報名人數要更新） */
  invalidates?: string[]
  /** 自訂成功提示，預設為「已新增／已更新／已刪除 + label」 */
  messages?: { create?: string; update?: string; remove?: string }
}

/**
 * 依 ResourceApi 產生一組 React Query hooks。
 * - 統一 queryKey 命名，避免各頁面自己拼 key 造成快取刷新不一致
 * - 新增 / 修改 / 刪除成功後自動刷新該資源的所有查詢，並跳出提示
 *
 * 用法：export const employeeHooks = createResourceHooks('employees', employeeApi, '員工')
 */
export function createResourceHooks<T extends BaseEntity>(
  resource: string,
  api: ResourceApi<T>,
  label: string,
  { invalidates = [], messages = {} }: HookOptions = {},
) {
  const keys = {
    all: [resource] as const,
    list: (params: ListParams) => [resource, 'list', params] as const,
    detail: (id: string) => [resource, 'detail', id] as const,
  }

  const onError = (err: Error) => toast.error(err.message)
  const invalidateAll = (qc: QueryClient) =>
    Promise.all([resource, ...invalidates].map((key) => qc.invalidateQueries({ queryKey: [key] })))

  /** enabled: false 時暫不發出請求，例如只有在需要時才載入下拉選單資料 */
  function useList(params: ListParams, { enabled = true }: { enabled?: boolean } = {}) {
    return useQuery({
      queryKey: keys.list(params),
      queryFn: () => api.list(params),
      enabled,
      // 換頁 / 搜尋時保留舊資料，避免表格閃爍
      placeholderData: keepPreviousData,
    })
  }

  function useDetail(id: string | undefined) {
    return useQuery({
      queryKey: keys.detail(id ?? ''),
      queryFn: () => api.get(id!),
      enabled: !!id,
    })
  }

  function useCreate() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (input: EntityInput<T>) => api.create(input),
      onSuccess: () => {
        invalidateAll(qc)
        toast.success(messages.create ?? `已新增${label}`)
      },
      onError,
    })
  }

  type UpdateVars = { id: string; input: Partial<EntityInput<T>>; successMessage?: string }
  type Snapshot = [QueryKey, unknown][]

  /**
   * successMessage 可自訂，例如「活動已上架」。
   * optimistic: true 時先更新畫面上的快取，不等 API 回應；失敗則還原並提示。
   * 適合結果幾乎一定成功、且使用者期待立即回饋的操作（例如上架切換），表單送出則不建議使用。
   */
  function useUpdate({ optimistic = false }: { optimistic?: boolean } = {}) {
    const qc = useQueryClient()
    return useMutation<T, Error, UpdateVars, { snapshot: Snapshot }>({
      mutationFn: (vars) => api.update(vars.id, vars.input),
      onMutate: optimistic
        ? async ({ id, input }) => {
            // 取消進行中的查詢，避免舊的回應蓋掉剛套用的樂觀結果
            await qc.cancelQueries({ queryKey: keys.all })
            const snapshot = qc.getQueriesData({ queryKey: keys.all })
            const patch = (row: T) => (row.id === id ? { ...row, ...input } : row)
            qc.setQueriesData<Paginated<T>>(
              { queryKey: [resource, 'list'] },
              (old) => old && { ...old, items: old.items.map(patch) },
            )
            qc.setQueryData<T>(keys.detail(id), (old) => old && patch(old))
            return { snapshot }
          }
        : undefined,
      onSuccess: (_data, vars) => {
        toast.success(vars.successMessage ?? messages.update ?? `已更新${label}`)
      },
      onError: (err, _vars, context) => {
        context?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data))
        onError(err)
      },
      // 成功或失敗都重新抓一次，確保與伺服器一致（例如篩選條件下該筆資料應該消失）
      onSettled: () => invalidateAll(qc),
    })
  }

  function useRemove() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => api.remove(id),
      onSuccess: () => {
        invalidateAll(qc)
        toast.success(messages.remove ?? `已刪除${label}`)
      },
      onError,
    })
  }

  return { keys, useList, useDetail, useCreate, useUpdate, useRemove }
}
