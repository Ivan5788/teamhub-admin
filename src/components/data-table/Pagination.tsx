import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
      <span>
        第 {from}–{to} 筆，共 {total} 筆
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="上一頁"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          variant="secondary"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="下一頁"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
