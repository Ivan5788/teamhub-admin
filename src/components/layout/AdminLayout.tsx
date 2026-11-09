import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { Building2, Menu, X } from 'lucide-react'
import { navigation } from '@/config/navigation'
import { cn } from '@/lib/utils'

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 手機版遮罩 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-2 px-6 text-white">
          <Building2 className="size-6 text-indigo-400" />
          <span className="font-semibold">公司管理後台</span>
          <button
            className="ml-auto lg:hidden"
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
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
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
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="開啟選單">
            <Menu className="size-5 text-slate-600" />
          </button>
          <div className="ml-auto flex items-center gap-3 text-sm text-slate-600">
            <span className="hidden sm:inline">管理員</span>
            <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100 font-medium text-indigo-700">
              A
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
