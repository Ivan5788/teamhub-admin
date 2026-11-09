import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { BaseEntity, EntityInput, ListParams, ResourceApi } from '@/lib/api'

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
) {
  const keys = {
    all: [resource] as const,
    list: (params: ListParams) => [resource, 'list', params] as const,
    detail: (id: string) => [resource, 'detail', id] as const,
  }

  const onError = (err: Error) => toast.error(err.message)

  function useList(params: ListParams) {
    return useQuery({
      queryKey: keys.list(params),
      queryFn: () => api.list(params),
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
        qc.invalidateQueries({ queryKey: keys.all })
        toast.success(`已新增${label}`)
      },
      onError,
    })
  }

  /** successMessage 可自訂，例如「活動已上架」 */
  function useUpdate() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (vars: { id: string; input: Partial<EntityInput<T>>; successMessage?: string }) =>
        api.update(vars.id, vars.input),
      onSuccess: (_data, vars) => {
        qc.invalidateQueries({ queryKey: keys.all })
        toast.success(vars.successMessage ?? `已更新${label}`)
      },
      onError,
    })
  }

  function useRemove() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => api.remove(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: keys.all })
        toast.success(`已刪除${label}`)
      },
      onError,
    })
  }

  return { keys, useList, useDetail, useCreate, useUpdate, useRemove }
}
