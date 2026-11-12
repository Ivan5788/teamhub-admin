import type { ReactNode } from 'react'
import { CircleAlert, Inbox } from 'lucide-react'
import { Button } from '@/components/ui'
import { useElementWidth } from '@/hooks/useElementWidth'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

export interface Column<T> {
  /** React key 用，同一張表內不可重複 */
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  className?: string
  /**
   * 手機版卡片中的位置，預設為一般資料格：
   * title 卡片標題、wide 佔滿整行、actions 底部操作區、hidden 手機版不顯示
   */
  mobile?: 'title' | 'wide' | 'actions' | 'hidden'
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
  /** 空狀態下的下一步，例如「清除篩選」或「新增」 */
  emptyAction?: ReactNode
  /**
   * 表格完整顯示所需的最小寬度（px）。可用寬度不足時改用卡片列表，
   * 依「表格實際可用的寬度」判斷，而不是螢幕寬度，所以平板、有側邊欄的小筆電也不會被切掉。
   */
  minTableWidth?: number
}

const SKELETON_ROWS = [0, 1, 2, 3, 4]

/**
 * 通用表格，寬度不夠時自動改成卡片列表。欄位用設定陣列描述，頁面不需要自己寫 <table> 結構：
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
  emptyAction,
  minTableWidth = 720,
}: DataTableProps<T>) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>()
  // 量到寬度前（或測試環境）先用螢幕寬度判斷
  const wideScreen = useMediaQuery('(min-width: 48rem)')
  const isTableLayout = width === undefined ? wideScreen : width >= minTableWidth

  let message: ReactNode = null
  if (!loading && error && !data) {
    message = (
      <StateMessage icon={<CircleAlert className="size-8 text-red-400" />}>
        <span role="alert">資料載入失敗，請稍後再試</span>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={() => onRetry()} className="mt-2">
            重新載入
          </Button>
        )}
      </StateMessage>
    )
  } else if (!loading && !data?.length) {
    message = (
      <StateMessage icon={<Inbox className="size-8 text-slate-300" />}>
        {emptyText}
        {emptyAction && <div className="mt-2">{emptyAction}</div>}
      </StateMessage>
    )
  }

  const busyText = loading && (
    <span role="status" className="sr-only">
      載入中
    </span>
  )

  const layout = { columns, data, rowKey, loading, fetching, message, busyText }
  return (
    <div ref={containerRef} className="@container">
      {isTableLayout ? <TableLayout {...layout} /> : <CardLayout {...layout} />}
    </div>
  )
}

interface LayoutProps<T> extends Pick<
  DataTableProps<T>,
  'columns' | 'data' | 'rowKey' | 'loading' | 'fetching'
> {
  message: ReactNode
  busyText: ReactNode
}

function CardLayout<T>({
  columns,
  data,
  rowKey,
  loading,
  fetching,
  message,
  busyText,
}: LayoutProps<T>) {
  return (
    <div className={cn('relative transition-opacity', fetching && 'opacity-60')}>
      {busyText}
      {loading ? (
        <div className="divide-y divide-slate-100">
          {SKELETON_ROWS.slice(0, 3).map((i) => (
            <div key={i} className="space-y-3 p-4">
              <Bar className="w-1/2" />
              <Bar className="w-3/4" />
              <Bar className="w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        (message ?? (
          <ul className="divide-y divide-slate-100">
            {data?.map((row) => (
              <li key={rowKey(row)}>
                <MobileCard columns={columns} row={row} />
              </li>
            ))}
          </ul>
        ))
      )}
    </div>
  )
}

function TableLayout<T>({
  columns,
  data,
  rowKey,
  loading,
  fetching,
  message,
  busyText,
}: LayoutProps<T>) {
  // relative：讓 sr-only（絕對定位）的欄位標題留在捲動容器內，不會把整個頁面撐寬
  return (
    <div className="relative overflow-x-auto">
      {busyText}
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
            SKELETON_ROWS.map((i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-4">
                    <Bar />
                  </td>
                ))}
              </tr>
            ))
          ) : message ? (
            <tr>
              <td colSpan={columns.length}>{message}</td>
            </tr>
          ) : (
            data?.map((row) => (
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

function MobileCard<T>({ columns, row }: { columns: Column<T>[]; row: T }) {
  const titles = columns.filter((c) => c.mobile === 'title')
  const fields = columns.filter((c) => !c.mobile || c.mobile === 'wide')
  const actions = columns.filter((c) => c.mobile === 'actions')

  // 窄卡片：標題 → 資料 → 操作，由上而下；
  // 寬卡片（平板、小筆電）：操作移到標題右側，資料攤成一排，避免卡片過高、留白過多
  return (
    <div className="grid gap-3 p-4 text-sm text-slate-700 @xl:grid-cols-[1fr_auto] @xl:gap-x-6">
      {titles.map((col) => (
        <div key={col.key} className="min-w-0">
          {col.render(row)}
        </div>
      ))}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 @xl:col-span-2 @xl:row-start-2 @xl:grid-cols-3 @2xl:grid-cols-4">
        {fields.map((col) => (
          <div
            key={col.key}
            className={cn('min-w-0', col.mobile === 'wide' && 'col-span-2 @xl:col-span-1')}
          >
            <dt className="text-xs text-slate-500">{col.header}</dt>
            <dd className="mt-0.5 break-words">{col.render(row)}</dd>
          </div>
        ))}
      </dl>
      {actions.map((col) => (
        <div key={col.key} className="@xl:col-start-2 @xl:row-start-1 @xl:self-center">
          {col.render(row)}
        </div>
      ))}
    </div>
  )
}

function StateMessage({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-16 text-center text-slate-500">
      {icon}
      {children}
    </div>
  )
}

function Bar({ className }: { className?: string }) {
  return <div className={cn('h-4 rounded bg-slate-200 motion-safe:animate-pulse', className)} />
}
