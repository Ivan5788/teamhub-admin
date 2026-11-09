import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui'

interface TableToolbarProps {
  keyword: string
  onKeywordChange: (value: string) => void
  placeholder?: string
  /** 右側的篩選器（Select 等） */
  children?: ReactNode
}

/** 表格上方的搜尋列 + 篩選器 */
export function TableToolbar({
  keyword,
  onKeywordChange,
  placeholder = '搜尋…',
  children,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="pl-9"
        />
      </div>
      {children && <div className="flex flex-wrap gap-3 [&>*]:w-auto">{children}</div>}
    </div>
  )
}
