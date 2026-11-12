import { createResourceApi } from '@/lib/api'
import { MockHttpError } from '@/lib/api/mock/db'
import { createResourceHooks } from '@/lib/query/create-resource-hooks'
// 報名規則會查員工資料：引用 employeeApi 確保模擬伺服器已註冊 employees 資源
import { employeeApi, type Employee } from '@/features/employees'
import { eventSeed, registrationSeed } from './mock-data'
import type { CompanyEvent, Registration } from './schema'
import { getRegistrationState } from './utils'

void employeeApi

const countRegistrations = (rows: Registration[], eventId: string) =>
  rows.filter((r) => r.eventId === eventId).length

export const eventApi = createResourceApi<CompanyEvent>({
  resource: 'events',
  mock: {
    seed: eventSeed,
    searchFields: ['title', 'location', 'description'],
    // 回應時附上報名人數，就像後端用 JOIN / COUNT 算好再回傳
    decorate: (event, db) => ({
      ...event,
      registeredCount: countRegistrations(db.table<Registration>('registrations').all(), event.id),
    }),
    beforeUpdate: (event, changes, db) => {
      const count = countRegistrations(db.table<Registration>('registrations').all(), event.id)
      if (changes.capacity !== undefined && changes.capacity < count) {
        throw new MockHttpError(409, `人數上限不能少於已報名人數（${count} 人）`)
      }
    },
  },
})

export const eventHooks = createResourceHooks('events', eventApi, '活動')

export const registrationApi = createResourceApi<Registration>({
  resource: 'registrations',
  mock: {
    seed: registrationSeed,
    searchFields: [],
    // 伺服器端的報名規則：前端隱藏按鈕之外，這裡才是真正的把關
    beforeCreate: ({ eventId, employeeId }, db) => {
      const event = db
        .table<CompanyEvent>('events')
        .all()
        .find((e) => e.id === eventId)
      if (!event) throw new MockHttpError(404, '找不到這個活動')
      const employee = db
        .table<Employee>('employees')
        .all()
        .find((e) => e.id === employeeId)
      if (!employee || employee.status !== 'active') {
        throw new MockHttpError(409, '只有在職員工可以報名')
      }
      const registrations = db.table<Registration>('registrations').all()
      if (registrations.some((r) => r.eventId === eventId && r.employeeId === employeeId)) {
        throw new MockHttpError(409, `${employee.name} 已經報名過了`)
      }
      const state = getRegistrationState(event, countRegistrations(registrations, event.id))
      if (state.reason) throw new MockHttpError(409, state.reason)
    },
    decorate: (registration, db) => {
      const employee = db
        .table<Employee>('employees')
        .all()
        .find((e) => e.id === registration.employeeId)
      return {
        ...registration,
        employee: employee
          ? { name: employee.name, email: employee.email, department: employee.department }
          : { name: '（已刪除的員工）', email: '', department: '' },
      }
    },
  },
})

export const registrationHooks = createResourceHooks('registrations', registrationApi, '報名', {
  // 報名異動會改變活動的報名人數
  invalidates: ['events'],
  messages: { create: '已加入報名', remove: '已取消報名' },
})

/**
 * 模組專屬的 hook 範例：在通用 CRUD 之上包裝業務動作。
 * 採樂觀更新：按下後立刻切換狀態，失敗才還原並提示。
 * 若後端提供專用 API（例如 POST /events/:id/publish），只要改這裡的實作。
 */
export function useTogglePublish() {
  const update = eventHooks.useUpdate({ optimistic: true })
  return {
    ...update,
    toggle: (event: CompanyEvent) => {
      const publishing = event.status !== 'published'
      update.mutate({
        id: event.id,
        input: { status: publishing ? 'published' : 'unpublished' },
        successMessage: publishing ? `「${event.title}」已上架` : `「${event.title}」已下架`,
      })
    },
  }
}
