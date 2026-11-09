import type { ReactNode } from 'react'
import { CircleAlert, Inbox, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface Column<T> {
  /** React key 用，同一張表內不可重複 */
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[] | undefined
  rowKey: (row: T) => string
  loading?: boolean
  /** 背景重新抓資料中（例如換頁），表格半透明但不清空 */
  fetching?: boolean
  /** 載入失敗。沒有資料可顯示時才會蓋掉表格，背景更新失敗則保留舊資料 */
  error?: boolean
  onRetry?: () => void
  emptyText?: string
}

/**
 * 通用表格。欄位用設定陣列描述，頁面不需要自己寫 <table> 結構：
 *   const columns: Column<Employee>[] = [{ key: 'name', header: '姓名', render: (r) => r.name }]
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading,
  fetching,
  error,
  onRetry,
  emptyText = '目前沒有資料',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-left font-medium whitespace-nowrap text-slate-600',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className={cn('divide-y divide-slate-100 transition-opacity', fetching && 'opacity-60')}
        >
          {loading ? (
            <StateRow colSpan={columns.length}>
              <Loader2 className="size-6 animate-spin text-slate-400" />
              載入中…
            </StateRow>
          ) : error && !data ? (
            <StateRow colSpan={columns.length}>
              <CircleAlert className="size-8 text-red-400" />
              <span role="alert">資料載入失敗，請稍後再試</span>
              {onRetry && (
                <Button variant="secondary" size="sm" onClick={() => onRetry()} className="mt-2">
                  重新載入
                </Button>
              )}
            </StateRow>
          ) : !data?.length ? (
            <StateRow colSpan={columns.length}>
              <Inbox className="size-8 text-slate-300" />
              {emptyText}
            </StateRow>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-slate-50/60">
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 text-slate-700', col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function StateRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16">
        <div className="flex flex-col items-center gap-2 text-slate-500">{children}</div>
      </td>
    </tr>
  )
}
