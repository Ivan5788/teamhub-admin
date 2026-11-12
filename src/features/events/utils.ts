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
