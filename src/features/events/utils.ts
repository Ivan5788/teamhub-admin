import type { BadgeTone } from '@/components/ui'
import { formatDate, formatTime } from '@/lib/utils'
import type { CompanyEvent } from './schema'

export interface EventPhase {
  /** 給程式判斷用；label 只負責顯示，文案改了也不影響邏輯 */
  key: 'upcoming' | 'ongoing' | 'ended'
  label: string
  tone: BadgeTone
}

/** 依時間推算活動進行階段（與上架狀態無關） */
export function getEventPhase(event: CompanyEvent, now = new Date()): EventPhase {
  const start = new Date(event.startAt)
  const end = new Date(event.endAt)
  if (now < start) return { key: 'upcoming', label: '未開始', tone: 'blue' }
  if (now <= end) return { key: 'ongoing', label: '進行中', tone: 'green' }
  return { key: 'ended', label: '已結束', tone: 'gray' }
}

/**
 * 活動時間區間。同一天只顯示一次日期（2026/11/19 14:00 – 16:00），
 * 版面更短也更好讀；跨日才顯示兩個完整日期。
 */
export function formatEventRange(event: Pick<CompanyEvent, 'startAt' | 'endAt'>) {
  const start = formatDate(event.startAt, true)
  const sameDay = formatDate(event.startAt) === formatDate(event.endAt)
  return sameDay
    ? `${start} – ${formatTime(event.endAt)}`
    : `${start} ～ ${formatDate(event.endAt, true)}`
}

export const isPublished = (event: CompanyEvent) => event.status === 'published'

export interface RegistrationState {
  key: 'open' | 'full' | 'ended' | 'unpublished'
  label: string
  tone: BadgeTone
  /** 不能報名時的原因，同時作為伺服器拒絕時的錯誤訊息 */
  reason?: string
}

/**
 * 報名狀態。前端用來決定是否顯示報名操作，模擬伺服器也用同一份規則檢查，
 * 確保畫面提示與伺服器回應的錯誤訊息一致。
 */
export function getRegistrationState(
  event: CompanyEvent,
  registeredCount = event.registeredCount ?? 0,
  now = new Date(),
): RegistrationState {
  if (!isPublished(event)) {
    return { key: 'unpublished', label: '未開放', tone: 'gray', reason: '活動尚未上架，無法報名' }
  }
  if (getEventPhase(event, now).key === 'ended') {
    return { key: 'ended', label: '已結束', tone: 'gray', reason: '活動已結束，無法報名' }
  }
  if (registeredCount >= event.capacity) {
    return { key: 'full', label: '已額滿', tone: 'red', reason: '名額已滿' }
  }
  return { key: 'open', label: '報名中', tone: 'green' }
}
