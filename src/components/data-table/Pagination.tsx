import { useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'

interface PaginationProps {
  page: number
  pageSize: number
  /** 資料還沒載入時傳 undefined，避免把網址上的 ?page=3 誤判成超出範圍 */
  total: number | undefined
  onChange: (page: number) => void
}

export function Pagination({ page: requestedPage, pageSize, total, onChange }: PaginationProps) {
  const count = total ?? 0
  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  const page = Math.min(requestedPage, totalPages)
  const from = count === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, count)

  // 刪掉最後一頁的唯一一筆，或網址頁碼過大時，退回實際存在的最後一頁
  useEffect(() => {
    if (total !== undefined && requestedPage > totalPages) onChange(totalPages)
  }, [total, requestedPage, totalPages, onChange])

  const goTo = (target: number) => {
    onChange(target)
    // 分頁鈕在列表底部，換頁後回到頂端才看得到新資料的開頭
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
      <span>
        第 {from}–{to} 筆，共 {count} 筆
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
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
          onClick={() => goTo(page + 1)}
          aria-label="下一頁"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
