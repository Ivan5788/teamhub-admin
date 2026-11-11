import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { Building2, Menu, X } from 'lucide-react'
import { navigation } from '@/config/navigation'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 64rem)')

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 手機版遮罩 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* inert：手機版收合時，選單裡的連結不能被 Tab 走到 */}
      <aside
        inert={!isDesktop && !mobileOpen}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-2 px-6 text-white">
          <Building2 className="size-6 text-indigo-400" />
          <span className="font-semibold">TeamHub</span>
          <button
            className="-mr-2 ml-auto flex size-11 items-center justify-center lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="關閉選單"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors lg:py-2',
                  'focus-visible:outline-2 focus-visible:outline-indigo-400',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white',
                )
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-8">
          <button
            className="-ml-2 flex size-11 items-center justify-center lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="開啟選單"
            aria-expanded={mobileOpen}
          >
            <Menu className="size-5 text-slate-600" />
          </button>
          <div className="ml-auto flex items-center gap-3 text-sm text-slate-600">
            <span className="hidden sm:inline">管理員</span>
            <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-700">
              A
            </div>
          </div>
        </header>
        <main className="px-4 py-5 sm:px-8 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
