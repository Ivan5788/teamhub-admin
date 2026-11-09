import { useSearchParams } from 'react-router'
import type { ListParams } from '@/lib/api'
import { useDebounce } from './useDebounce'

/**
 * 列表頁的「分頁 / 關鍵字 / 篩選」狀態，同步存在網址上（?page=2&q=王&status=active）。
 * 好處：重新整理不會遺失、可以直接把網址貼給同事。
 *
 * 用法：
 *   const list = useListState({ filterKeys: ['status', 'department'] })
 *   const { data } = employeeHooks.useList(list.params)
 */
export function useListState<K extends string = never>({
  filterKeys = [],
  pageSize = 10,
}: { filterKeys?: readonly K[]; pageSize?: number } = {}) {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const keyword = searchParams.get('q') ?? ''
  const filters = Object.fromEntries(
    filterKeys.map((k) => [k, searchParams.get(k) ?? '']),
  ) as Record<K, string>

  const debouncedKeyword = useDebounce(keyword)

  /** 改搜尋或篩選條件時，自動回到第 1 頁 */
  const setParam = (key: string, value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        if (key !== 'page') next.delete('page')
        return next
      },
      { replace: true },
    )
  }

  const params: ListParams = { page, pageSize, keyword: debouncedKeyword, filters }

  return {
    params,
    page,
    pageSize,
    keyword,
    filters,
    setPage: (p: number) => setParam('page', p > 1 ? String(p) : ''),
    setKeyword: (q: string) => setParam('q', q),
    setFilter: (key: K, value: string) => setParam(key, value),
  }
}
