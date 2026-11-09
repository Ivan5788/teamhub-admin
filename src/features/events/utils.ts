import type { BadgeTone } from '@/components/ui'
import type { CompanyEvent } from './schema'

/** 依時間推算活動進行階段（與上架狀態無關） */
export function getEventPhase(event: CompanyEvent, now = new Date()) {
  const start = new Date(event.startAt)
  const end = new Date(event.endAt)
  if (now < start) return { label: '未開始', tone: 'blue' as BadgeTone }
  if (now <= end) return { label: '進行中', tone: 'green' as BadgeTone }
  return { label: '已結束', tone: 'gray' as BadgeTone }
}

export const isPublished = (event: CompanyEvent) => event.status === 'published'
