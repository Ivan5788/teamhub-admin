import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { CalendarCheck, CalendarClock, Users, type LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge, Button, Card } from '@/components/ui'
import { employeeHooks } from '@/features/employees'
import { EVENT_CATEGORY, eventHooks, getEventPhase } from '@/features/events'
import { cn, formatDate } from '@/lib/utils'

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
    .filter((e) => getEventPhase(e).key !== 'ended')
    .sort((a, b) => a.startAt.localeCompare(b.startAt))

  return (
    <>
      <PageHeader title="總覽" description="公司人員與活動概況" />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          icon={Users}
          label="在職員工"
          value={activeEmployees.data?.total}
          to="/employees?status=active"
        />
        <StatCard
          icon={CalendarCheck}
          label="已上架活動"
          value={publishedEvents.data?.total}
          to="/events?status=published"
        />
        <StatCard
          icon={CalendarClock}
          label="即將舉辦"
          value={publishedEvents.data && upcoming.length}
          to="/events?status=published"
        />
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
              <Badge tone={EVENT_CATEGORY.tone(e.category)}>
                {EVENT_CATEGORY.label(e.category)}
              </Badge>
            </li>
          ))}
          {publishedEvents.data && upcoming.length === 0 && (
            <EmptyRow>目前沒有即將舉辦的活動</EmptyRow>
          )}
          {publishedEvents.isLoading &&
            [0, 1, 2].map((i) => (
              <li key={i} className="space-y-2 px-5 py-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </li>
            ))}
          {publishedEvents.isError && !publishedEvents.data && (
            <EmptyRow>
              <span role="alert">活動資料載入失敗</span>
              <Button
                variant="secondary"
                size="sm"
                className="ml-3"
                onClick={() => publishedEvents.refetch()}
              >
                重新載入
              </Button>
            </EmptyRow>
          )}
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
    <Link
      to={to}
      className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      <Card className="flex h-full flex-col items-start gap-2 p-3 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 sm:size-12 sm:rounded-xl">
          <Icon className="size-5 text-indigo-600 sm:size-6" />
        </div>
        <div>
          <div className="text-xs text-slate-500 sm:text-sm">{label}</div>
          <div className="text-xl font-semibold text-slate-900 tabular-nums sm:text-2xl">
            {value ?? <Skeleton className="mt-1 h-6 w-8" />}
          </div>
        </div>
      </Card>
    </Link>
  )
}

function Skeleton({ className }: { className: string }) {
  return <div className={cn('rounded bg-slate-200 motion-safe:animate-pulse', className)} />
}

function EmptyRow({ children }: { children: ReactNode }) {
  return <li className="px-5 py-10 text-center text-sm text-slate-500">{children}</li>
}
