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
  /** 輕微震動一次，用來提示操作失敗；動畫結束時呼叫 onShakeEnd */
  shaking?: boolean
  onShakeEnd?: () => void
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  shaking,
  onShakeEnd,
}: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  // deps 只放 open：onClose 常是 inline 函式，放進來的話每次 render 都會搶走輸入中的焦點
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    // 優先聚焦內容裡的第一個欄位；確認框沒有欄位時聚焦彈窗本身，避免 Enter 誤觸刪除。
    // 觸控裝置不聚焦欄位，否則虛擬鍵盤一開窗就彈出，遮住大半表單
    const isTouch = window.matchMedia?.('(pointer: coarse)').matches
    const field = isTouch ? null : bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE)
    ;(field ?? dialogRef.current)?.focus()
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
      <div
        className="absolute inset-0 bg-slate-900/50 motion-safe:animate-fade-in"
        onClick={onClose}
      />
      {/* 進場動畫放外層：同一元素換成震動動畫再換回來時，進場動畫會重播 */}
      <div
        className={cn(
          'relative w-full motion-safe:animate-sheet-in sm:motion-safe:animate-dialog-in',
          sizes[size],
        )}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget) onShakeEnd?.()
          }}
          className={cn(
            'flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-xl outline-none sm:max-h-[90dvh] sm:rounded-2xl',
            shaking && 'motion-safe:animate-shake',
          )}
        >
          <header className="flex shrink-0 items-center justify-between border-b border-slate-200 py-3 pr-3 pl-4 sm:px-6 sm:py-4">
            <h2 id={titleId} className="text-base font-semibold text-slate-900">
              {title}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="關閉">
              <X className="size-5 sm:size-4" />
            </Button>
          </header>
          <div
            ref={bodyRef}
            className={cn(
              'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6',
              !footer && 'pb-[calc(1.25rem+env(safe-area-inset-bottom))]',
            )}
          >
            {children}
          </div>
          {footer && (
            <footer className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-200 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-4 [&>button]:flex-1 sm:[&>button]:flex-none">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
