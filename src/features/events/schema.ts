import { z } from 'zod'
import type { BaseEntity } from '@/lib/api'
import { EVENT_CATEGORY, EVENT_STATUS } from './constants'

/**
 * 注意：表單上的時間是 datetime-local 格式（2026-10-05T14:00），
 * 送出前會在 EventFormModal 轉成 ISO 字串存到後端。
 */
const eventFields = z.object({
  title: z.string().trim().min(1, '請輸入活動名稱').max(100, '最多 100 字'),
  category: z.enum(EVENT_CATEGORY.keys, { error: '請選擇類別' }),
  description: z.string().trim().max(1000, '最多 1000 字'),
  location: z.string().trim().min(1, '請輸入地點'),
  startAt: z.string().min(1, '請選擇開始時間'),
  endAt: z.string().min(1, '請選擇結束時間'),
  capacity: z.number({ error: '請輸入人數' }).int('需為整數').min(1, '至少 1 人'),
  coverUrl: z.union([z.literal(''), z.url('網址格式不正確')]),
  status: z.enum(EVENT_STATUS.keys),
})

const eventDateFields = eventFields.pick({ startAt: true, endAt: true })

export const eventFormSchema = eventFields.refine((d) => new Date(d.endAt) > new Date(d.startAt), {
  message: '結束時間需晚於開始時間',
  path: ['endAt'],
  // zod 預設在其他欄位有錯時略過 refine；只要兩個時間都有填就要即時檢查
  when: ({ value }) => eventDateFields.safeParse(value).success,
})

export type EventFormValues = z.infer<typeof eventFormSchema>
export type CompanyEvent = BaseEntity &
  EventFormValues & {
    /** 已報名人數，由伺服器計算後附在回應中（唯讀，不在表單裡） */
    registeredCount?: number
  }

/** 員工報名紀錄。employee 是伺服器回應時附上的員工摘要，方便列表直接顯示 */
export interface Registration extends BaseEntity {
  eventId: string
  employeeId: string
  employee?: { name: string; email: string; department: string }
}
