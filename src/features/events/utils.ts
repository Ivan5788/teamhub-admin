import type { BadgeTone } from '@/components/ui'
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

export const isPublished = (event: CompanyEvent) => event.status === 'published'
