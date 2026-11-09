import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { CalendarCheck, CalendarClock, Users, type LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge, Card } from '@/components/ui'
import { employeeHooks } from '@/features/employees'
import { EVENT_CATEGORY, eventHooks, getEventPhase } from '@/features/events'
import { formatDate } from '@/lib/utils'

export function DashboardPage() {
  const activeEmployees = employeeHooks.useList({
    page: 1,
    pageSize: 1,
    filters: { status: 'active' },
  })
  // 示範用：一次取回已上架活動在前端篩選。正式環境建議請後端提供 upcoming 查詢參數
  const publishedEvents = eventHooks.useList({
    page: 1,
    pageSize: 100,
    filters: { status: 'published' },
  })

  const upcoming = (publishedEvents.data?.items ?? [])
    .filter((e) => getEventPhase(e).label !== '已結束')
    .sort((a, b) => a.startAt.localeCompare(b.startAt))

  return (
    <>
      <PageHeader title="總覽" description="公司人員與活動概況" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="在職員工" value={activeEmployees.data?.total} to="/employees?status=active" />
        <StatCard icon={CalendarCheck} label="已上架活動" value={publishedEvents.data?.total} to="/events?status=published" />
        <StatCard icon={CalendarClock} label="即將舉辦" value={publishedEvents.data && upcoming.length} to="/events?status=published" />
      </div>

      <Card className="mt-6">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">近期上架活動</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {upcoming.slice(0, 5).map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium text-slate-900">{e.title}</div>
                <div className="text-xs text-slate-500">
                  {formatDate(e.startAt, true)} · {e.location}
                </div>
              </div>
              <Badge tone={EVENT_CATEGORY.tone(e.category)}>{EVENT_CATEGORY.label(e.category)}</Badge>
            </li>
          ))}
          {publishedEvents.data && upcoming.length === 0 && (
            <EmptyRow>目前沒有即將舉辦的活動</EmptyRow>
          )}
          {publishedEvents.isLoading && <EmptyRow>載入中…</EmptyRow>}
        </ul>
      </Card>
    </>
  )
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number | undefined
  to: string
}

function StatCard({ icon: Icon, label, value, to }: StatCardProps) {
  return (
    <Link to={to}>
      <Card className="flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
        <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50">
          <Icon className="size-6 text-indigo-600" />
        </div>
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="text-2xl font-semibold text-slate-900 tabular-nums">{value ?? '–'}</div>
        </div>
      </Card>
    </Link>
  )
}

function EmptyRow({ children }: { children: ReactNode }) {
  return <li className="px-5 py-10 text-center text-sm text-slate-500">{children}</li>
}
