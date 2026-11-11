import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui'

const COMMIT_DELAY = 300

interface TableToolbarProps {
  keyword: string
  onKeywordChange: (value: string) => void
  placeholder?: string
  /** 右側的篩選器（Select 等） */
  children?: ReactNode
}

/**
 * 表格上方的搜尋列 + 篩選器。
 * 輸入框的值存在本地 state，停止輸入後才寫回網址：網址更新不是同步的，直接當作
 * 受控值會在注音等輸入法組字時蓋掉內容，造成重複字元。組字期間也不會觸發搜尋。
 */
export function TableToolbar({
  keyword,
  onKeywordChange,
  placeholder = '搜尋…',
  children,
}: TableToolbarProps) {
  const [draft, setDraft] = useState(keyword)
  const composing = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const lastSent = useRef(keyword)

  // 計時結束時要用最新的 callback，否則會用舊的網址參數蓋掉這段時間內改的篩選條件
  const latestOnChange = useRef(onKeywordChange)
  useEffect(() => {
    latestOnChange.current = onKeywordChange
  })

  useEffect(() => () => clearTimeout(timer.current), [])

  // 網址被其他操作改變時（例如點側邊欄清掉查詢），同步回輸入框
  useEffect(() => {
    if (keyword === lastSent.current) return
    lastSent.current = keyword
    clearTimeout(timer.current)
    setDraft(keyword)
  }, [keyword])

  const scheduleCommit = (value: string) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      lastSent.current = value
      latestOnChange.current(value)
    }, COMMIT_DELAY)
  }

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (!composing.current) scheduleCommit(e.target.value)
          }}
          onCompositionStart={() => {
            composing.current = true
            clearTimeout(timer.current)
          }}
          onCompositionEnd={(e) => {
            composing.current = false
            scheduleCommit(e.currentTarget.value)
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="pl-9"
        />
      </div>
      {children && (
        <div className="flex gap-3 [&>*]:min-w-0 [&>*]:flex-1 sm:[&>*]:w-auto sm:[&>*]:flex-none">
          {children}
        </div>
      )}
    </div>
  )
}
