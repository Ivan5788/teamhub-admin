import { useState } from 'react'
import { UserMinus, UserPlus, Users } from 'lucide-react'
import { Badge, Button, Modal, Select } from '@/components/ui'
import { DEPARTMENT, employeeHooks } from '@/features/employees'
import { useAuth } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import { registrationHooks } from '../api'
import type { CompanyEvent } from '../schema'
import { formatEventRange, getRegistrationState } from '../utils'
import { CapacityBar } from './RegistrationCount'

interface Props {
  event: CompanyEvent
  onClose: () => void
}

/** 活動報名名單：查看報名者，並依權限新增或取消報名 */
export function RegistrationModal({ event, onClose }: Props) {
  const { can } = useAuth()
  const [employeeId, setEmployeeId] = useState('')

  const registrations = registrationHooks.useList({
    page: 1,
    pageSize: 1000,
    filters: { eventId: event.id },
  })
  const createMutation = registrationHooks.useCreate()
  const removeMutation = registrationHooks.useRemove()

  const rows = registrations.data?.items ?? []
  // 以名單筆數為準（活動列表上的人數可能還沒刷新）
  const count = registrations.data ? rows.length : (event.registeredCount ?? 0)
  const state = getRegistrationState(event, count)
  const canRegister = can('registrations:create') && state.key === 'open'

  // 只列出還沒報名的在職員工
  const activeEmployees = employeeHooks.useList(
    { page: 1, pageSize: 1000, filters: { status: 'active' } },
    { enabled: canRegister },
  )
  const registered = new Set(rows.map((r) => r.employeeId))
  const candidates = (activeEmployees.data?.items ?? [])
    .filter((e) => !registered.has(e.id))
    .map((e) => ({ value: e.id, label: `${e.name}（${DEPARTMENT.label(e.department)}）` }))

  const register = () =>
    createMutation.mutate({ eventId: event.id, employeeId }, { onSuccess: () => setEmployeeId('') })

  return (
    <Modal open onClose={onClose} title={`報名名單｜${event.title}`} size="lg">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600">{formatEventRange(event)}</div>
          <Badge tone={state.tone}>{state.label}</Badge>
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="text-slate-600">已報名</span>
            <span className="font-medium text-slate-900 tabular-nums">
              {count} / {event.capacity} 人
            </span>
          </div>
          <CapacityBar count={count} capacity={event.capacity} />
        </div>

        {canRegister ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              options={candidates}
              placeholder={activeEmployees.isLoading ? '載入員工中…' : '選擇要報名的員工'}
              aria-label="選擇要報名的員工"
              disabled={activeEmployees.isLoading}
            />
            <Button
              onClick={register}
              disabled={!employeeId}
              loading={createMutation.isPending}
              className="sm:w-auto"
            >
              <UserPlus className="size-4" />
              加入報名
            </Button>
          </div>
        ) : (
          state.reason &&
          can('registrations:create') && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {state.reason}，目前無法新增報名。
            </p>
          )
        )}

        <section aria-labelledby="registration-list-title">
          <h3 id="registration-list-title" className="sr-only">
            報名者
          </h3>
          {registrations.isLoading ? (
            <p role="status" className="py-8 text-center text-sm text-slate-500">
              載入中…
            </p>
          ) : registrations.isError ? (
            <p role="alert" className="py-8 text-center text-sm text-red-600">
              報名名單載入失敗，請稍後再試
            </p>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-sm text-slate-500">
              <Users className="size-8 text-slate-300" />
              還沒有人報名
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-medium text-indigo-700">
                    {r.employee?.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-slate-900">{r.employee?.name}</div>
                    <div className="truncate text-xs text-slate-500">
                      {r.employee?.department && DEPARTMENT.label(r.employee.department)}
                      {' · '}報名於 {formatDate(r.createdAt, true)}
                    </div>
                  </div>
                  {can('registrations:delete') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMutation.mutate(r.id)}
                      disabled={removeMutation.isPending && removeMutation.variables === r.id}
                      aria-label={`取消 ${r.employee?.name} 的報名`}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <UserMinus className="size-4" />
                      <span className="hidden sm:inline">取消報名</span>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Modal>
  )
}
