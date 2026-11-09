import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** 讓 Tab / Shift+Tab 在彈窗內循環，不會跑到背景頁面 */
function trapTab(e: KeyboardEvent, dialog: HTMLElement) {
  const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE)
  if (focusable.length === 0) {
    e.preventDefault()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement

  if (e.shiftKey && (active === first || active === dialog || !dialog.contains(active))) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
    e.preventDefault()
    first.focus()
  }
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  /** 底部按鈕區，通常放「取消 / 確認」 */
  footer?: ReactNode
  size?: keyof typeof sizes
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  // deps 只放 open：onClose 常是 inline 函式，放進來的話每次 render 都會搶走輸入中的焦點
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    // 優先聚焦內容裡的第一個欄位；確認框沒有欄位時聚焦彈窗本身，避免 Enter 誤觸刪除
    const initial = bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? dialogRef.current
    initial?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'Tab' && dialogRef.current) trapTab(e, dialogRef.current)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white shadow-xl outline-none sm:rounded-2xl',
          sizes[size],
        )}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id={titleId} className="text-base font-semibold text-slate-900">
            {title}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="關閉">
            <X className="size-4" />
          </Button>
        </header>
        <div ref={bodyRef} className="overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer && (
          <footer className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}
