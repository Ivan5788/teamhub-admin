import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui'
import { ROLE, useAuth } from '@/lib/auth'

/** 右上角的使用者選單：顯示目前帳號與角色，提供登出 */
export function UserMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null

  return (
    <div ref={rootRef} className="relative ml-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`帳號選單：${user.name}`}
        className="-mr-2 flex h-11 items-center gap-2 rounded-lg px-2 text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-700">
          {user.name.slice(0, 1)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block leading-tight font-medium">{user.name}</span>
          <span className="block text-xs leading-tight text-slate-500">
            {ROLE.label(user.role)}
          </span>
        </span>
        <ChevronDown className="hidden size-4 text-slate-400 sm:block" />
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute right-0 mt-2 w-64 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200 motion-safe:animate-fade-in"
        >
          <div className="border-b border-slate-100 px-3 pt-2 pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium text-slate-900">{user.name}</span>
              <Badge tone={ROLE.tone(user.role)}>{ROLE.label(user.role)}</Badge>
            </div>
            <div className="mt-0.5 truncate text-xs text-slate-500">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="mt-1 flex h-11 w-full items-center gap-2 rounded-lg px-3 text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 sm:h-9"
          >
            <LogOut className="size-4" />
            登出
          </button>
        </div>
      )}
    </div>
  )
}
